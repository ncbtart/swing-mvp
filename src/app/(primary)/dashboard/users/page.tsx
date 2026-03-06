"use client";

import { useEffect, useState } from "react";

import ButtonGroup from "@/app/_components/core/ButtonGroup";
import SearchInput from "@/app/_components/core/SearchInput";
import { api } from "@/trpc/react";

import { debounce } from "lodash";

import GenericTable from "@/app/_components/core/GenericTable";
import Link from "next/link";

import { RoleNameLabels } from "@/utils/constantes";
import { RoleName } from "@prisma/client";
import { usePopup } from "@/app/_hooks/usePopUp";

export default function Utilisateurs() {
  const [roleFilter, setRoleFilter] = useState<RoleName | undefined>(undefined);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInputValue);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearch(searchInputValue);
    }, 300);

    handler();

    // Nettoyez l'effet en annulant la fonction debounced si le composant est démonté
    // ou si `searchInputValue` change avant que le délai ne soit écoulé.
    return () => {
      handler.cancel();
    };
  }, [searchInputValue]);

  const [skip, setSkip] = useState(0);

  const [deleteUser, setDeleteUser] = useState<{
    role: {
      id: string;
      name: RoleName;
    };
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    id: string;
  } | null>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  const {
    data: users,
    isPending,
    refetch,
  } = api.user.findAll.useQuery({
    skip,
    take: 10,
    search: debouncedSearch,
    role: roleFilter,
  });

  const deleteUserMutation = api.user.delete.useMutation({
    onSuccess: async () => {
      setDeleteUser(null);
      await refetch();
      setTitle("Utilisateur supprimé");
      setMessage("L'utilisateur a été supprimé avec succès");
      openPopup();
    },
  });

  const handleActiveChange = (_activeLabel: string) => undefined;

  const handleDeleteUser = () => {
    if (!deleteUser) return;
    deleteUserMutation.mutate({ userId: deleteUser.id });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Liste utilisateurs
          </h1>

          <Link
            href="/dashboard/users/create"
            className="mt-4 inline-block text-blue-600"
          >
            Ajouter un utilisateur
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <ButtonGroup
              buttons={[
                { label: "Tous", onClick: () => setRoleFilter(undefined) },
                {
                  label: "Admins",
                  onClick: () => setRoleFilter(RoleName.ADMIN),
                },
                {
                  label: "Chefs Secteurs",
                  onClick: () => setRoleFilter(RoleName.CHEF),
                },
                {
                  label: "Commerciaux",
                  onClick: () => setRoleFilter(RoleName.COMMERCIAL),
                },
              ]}
              onActiveChange={handleActiveChange}
            />

            <SearchInput
              placeholder="Rechercher ..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
          </div>

          {isPending ? (
            // loading animation
            <div className="flex h-96 items-center justify-center">
              <svg
                aria-hidden="true"
                className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <GenericTable
              data={users?.data.map((u) => ({ ...u, role: u.role.name })) ?? []}
              columns={[
                { key: "firstname", title: "Prénom" },
                { key: "lastname", title: "Nom" },
                { key: "email", title: "Email" },
                {
                  key: "role",
                  title: "Rôle",
                  render: (role: string | null) =>
                    RoleNameLabels[role as RoleName],
                },
                {
                  key: "id",
                  title: "",
                  render: (id: string | null) => (
                    <div className="text-center">
                      <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                        <Link
                          href={`/dashboard/users/edit/${id}`}
                          className="inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative"
                          title="Edit User"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </Link>

                        <button
                          className="inline-block p-3 text-gray-700 hover:bg-gray-50 focus:relative"
                          title="Delete User"
                          onClick={() =>
                            setDeleteUser(
                              users?.data.find((u) => u.id === id) ?? null,
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </span>
                    </div>
                  ),
                },
              ]}
              skip={skip}
              take={10}
              total={users?.total ?? 0}
              onPageChange={(skip) => {
                setSkip(skip);
              }}
            />
          )}
        </main>

        {deleteUser && (
          <>
            <div
              role="alert"
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="rounded-xl border border-gray-100 bg-white p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <strong className="block font-medium text-gray-900">
                      Supprimer utilisateur
                    </strong>

                    <p className="mt-2 text-sm text-gray-700">
                      Êtes-vous sûr de vouloir supprimer{" "}
                      <strong>
                        {deleteUser.firstname} {deleteUser.lastname}
                      </strong>
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                        onClick={() => setDeleteUser(null)}
                      >
                        <span className="text-sm">Annuler</span>
                      </button>

                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        onClick={handleDeleteUser}
                      >
                        <span className="text-sm">Valider</span>
                      </button>
                    </div>
                  </div>

                  <button
                    className="text-gray-500 transition hover:text-gray-600"
                    onClick={() => setDeleteUser(null)}
                  >
                    <span className="sr-only">Dismiss popup</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
          </>
        )}
      </div>
    </div>
  );
}
