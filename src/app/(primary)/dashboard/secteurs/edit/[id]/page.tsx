"use client";

import Link from "next/link";

import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import { type RoleName, type Departement } from "@prisma/client";
import { RoleNameLabels } from "@/utils/constantes";
import { useRouter } from "next/navigation";
import { usePopup } from "@/app/_hooks/usePopUp";

interface Commerciaux {
  user: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    role: {
      name: RoleName;
    };
  };
}

export default function SecteurEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: secteur, isPending } = api.secteur.findOne.useQuery({
    secteurId: params.id,
  });

  const router = useRouter();

  const { data: allDepartements, isPending: deptPending } =
    api.departement.findAll.useQuery();

  const { data: allUsers, isPending: userPending } =
    api.user.findAllCommerciaux.useQuery();

  const depRef = useRef<HTMLInputElement>(null);

  const comRef = useRef<HTMLInputElement>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  const [departements, setDepartements] = useState<
    Omit<Departement, "secteurId">[]
  >([]);

  const [commerciaux, setCommerciaux] = useState<Commerciaux[]>([]);

  const editMutation = api.secteur.edit.useMutation({
    onSuccess: () => {
      // redirect to secteurs page
      router.push("/dashboard/secteurs");
      setMessage("Le secteur a été modifié avec succès");
      setTitle("Succès");
      openPopup();
    },
    onError: (error) => {
      setMessage(error.message);
      setTitle("Erreur");
      openPopup();
    },
  });

  useEffect(() => {
    if (secteur) {
      setDepartements(secteur.departement as Omit<Departement, "secteurId">[]);
      setCommerciaux(secteur.secteurUser as Commerciaux[]);
    }
  }, [secteur]);

  const handleAddDept = (e: React.MouseEvent) => {
    e.preventDefault();

    const deptCode = depRef.current?.value;

    if (!deptCode) return;

    const dept = allDepartements?.find((d) => d.code === deptCode);

    if (dept) {
      setDepartements((prev) => {
        // check if dept already exists

        if (prev.find((d) => d.id === dept.id)) {
          return prev;
        }

        // sort by code before adding
        const sorted = [...prev, dept].sort((a, b) =>
          a.code.localeCompare(b.code),
        );

        return sorted;
      });
    }

    depRef.current.value = "";
  };

  const handleAddCommercial = (e: React.MouseEvent) => {
    e.preventDefault();

    const comName = comRef.current?.value;

    if (!comName) return;

    const com = allUsers?.find(
      (c) => `${c.firstname} ${c.lastname}` === comName,
    );

    if (com) {
      setCommerciaux((prev) => {
        // check if com already exists

        if (prev.find((c) => c.user.id === com.id)) {
          return prev;
        }

        // sort by lastname before adding
        const sorted = [
          ...prev,
          {
            user: com,
          },
        ].sort((a, b) =>
          (a.user?.lastname ?? "").localeCompare(b.user?.lastname ?? ""),
        );

        return sorted;
      });
    }

    comRef.current.value = "";
  };

  const handleDeleteDept = (deptId: string) => {
    setDepartements((prev) => prev.filter((dept) => dept.id !== deptId));
  };

  const handleDeleteCommercial = (userId: string) => {
    setCommerciaux((prev) => prev.filter((c) => c.user.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const body = {
      name: formData.get("name"),
    };

    const secteurData = {
      id: secteur?.id,
      name: body.name,
      departementIds: departements.map((d) => d.id),
      userIds: commerciaux.map((c) => c.user.id),
    };

    if (!secteurData.id) return;

    editMutation.mutate({
      secteurId: secteurData.id,
      name: secteurData.name as string,
      departementIds: secteurData.departementIds,
      commerciauxIds: secteurData.userIds,
    });
  };

  if (!isPending && !secteur) {
    return (
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
        <div className="flex-grow">
          <main className="my-0">
            <h1 className="text-center text-xl text-red-600 sm:text-4xl">
              Oups ...
            </h1>
            <p className="mt-4 text-center text-lg text-gray-600">
              Le secteur n&apos;existe pas
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
        <div className="flex-grow">
          <main className="my-0">
            <h1 className="text-xl text-black sm:text-2xl">
              Édition du secteur
            </h1>

            <Link
              href="/dashboard/secteurs"
              className="mt-4 inline-block text-blue-600"
            >
              <span className="mb-3 mr-3 text-blue-600">←</span>
              Retour à la liste des secteurs
            </Link>

            {isPending ? (
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
              <div className="mt-6 rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <label htmlFor="lastname" className="sr-only">
                      Nom
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                        placeholder="Nom"
                        name="name"
                        defaultValue={secteur?.name ?? ""}
                        required
                      />
                    </div>
                  </div>

                  {/* list of departements */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="mt-3 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
                      <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-5">
                        <h6 className="col-span-2 self-center font-medium">
                          Départements
                        </h6>

                        <div className="col-span-2">
                          <div className="relative">
                            <input
                              type="text"
                              list="deptList"
                              id="dept"
                              ref={depRef}
                              className="w-full rounded-lg border border-gray-200 p-4 pe-12 text-sm shadow-sm sm:text-sm [&::-webkit-calendar-picker-indicator]:opacity-0"
                              placeholder="Selectionner ..."
                            />

                            <span className="absolute inset-y-0 end-0 flex w-8 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-5 text-gray-500"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                                />
                              </svg>
                            </span>
                          </div>

                          <datalist id="deptList">
                            {deptPending ? (
                              <option>Loading...</option>
                            ) : (
                              allDepartements?.map((dept) => (
                                <option key={dept.id} value={dept.code}>
                                  {dept.name}
                                </option>
                              ))
                            )}
                          </datalist>
                        </div>

                        <div className="flex items-center justify-center">
                          <button
                            onClick={handleAddDept}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            <span className="text-sm">Ajouter</span>
                          </button>
                        </div>

                        {
                          // add button
                        }
                      </div>
                      <dl className="-mb-3 divide-y divide-gray-100 text-sm">
                        {departements.map(
                          (dept: {
                            id: string;
                            code: string;
                            name: string;
                          }) => (
                            <div
                              key={dept.id}
                              className="grid border-collapse grid-cols-5 gap-1 border border-gray-100 py-3 even:bg-gray-50 sm:grid-cols-5 sm:gap-4"
                            >
                              <dt className="px-1 text-center font-medium text-gray-900">
                                {dept.code}
                              </dt>
                              <dd className="col-span-3 px-1 text-gray-700 sm:col-span-3">
                                {dept.name}
                              </dd>
                              <dd className="px-1 text-center text-gray-700">
                                {/* delete button */}

                                <button
                                  className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                                  title="Delete Departement"
                                  onClick={() => handleDeleteDept(dept.id)}
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
                              </dd>
                            </div>
                          ),
                        )}
                      </dl>
                    </div>
                    <div className="mt-3 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
                      <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-5">
                        <h6 className="col-span-2 self-center font-medium">
                          Commerciaux
                        </h6>

                        <div className="col-span-2">
                          <div className="relative">
                            <input
                              type="text"
                              list="comList"
                              ref={comRef}
                              className="shadow-smsm:text-sm w-full rounded-lg border border-gray-200 p-4 pe-12 text-sm [&::-webkit-calendar-picker-indicator]:opacity-0"
                              placeholder="Selectionner ..."
                            />

                            <span className="absolute inset-y-0 end-0 flex w-8 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-5 text-gray-500"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                                />
                              </svg>
                            </span>
                          </div>

                          <datalist id="comList">
                            {userPending ? (
                              <option>Loading...</option>
                            ) : (
                              allUsers?.map((com) => (
                                <option
                                  key={com.id}
                                  value={`${com.firstname} ${com.lastname}`}
                                ></option>
                              ))
                            )}
                          </datalist>
                        </div>

                        <div className="flex items-center justify-center">
                          <button
                            onClick={handleAddCommercial}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            <span className="text-sm">Ajouter</span>
                          </button>
                        </div>

                        {
                          // add button
                        }
                      </div>
                      <dl className="-mb-3 divide-y divide-gray-100 text-sm">
                        {commerciaux.map((commercial) => (
                          <div
                            key={commercial.user.id}
                            className="grid border-collapse grid-cols-5 gap-1 border border-gray-100 py-3 shadow-sm even:bg-gray-50 sm:grid-cols-4 sm:gap-4"
                          >
                            <dt className="px-1 text-center font-medium text-gray-900 sm:col-span-2">
                              {commercial.user.firstname}{" "}
                              {commercial.user.lastname}
                            </dt>

                            <dd className="px-1 text-center text-gray-700">
                              {RoleNameLabels[commercial.user.role.name]}
                            </dd>

                            <dd className="px-1 text-center text-gray-700">
                              {/* delete button */}
                              <button
                                className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                                title="Delete Commercial"
                                onClick={() =>
                                  handleDeleteCommercial(commercial.user.id)
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
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-row-reverse">
                    <button
                      type="submit"
                      className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white sm:w-auto"
                    >
                      Sauvegarder le secteur
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
