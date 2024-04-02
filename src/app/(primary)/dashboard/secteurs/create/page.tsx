"use client";

import Link from "next/link";

import { api } from "@/trpc/react";
import { useRef, useState } from "react";
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

export default function SecteurCreatePage() {
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

  const createMutation = api.secteur.create.useMutation({
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
      name: body.name,
      departementIds: departements.map((d) => d.id),
      userIds: commerciaux.map((c) => c.user.id),
    };

    createMutation.mutate({
      name: secteurData.name as string,
      departementIds: secteurData.departementIds,
      commerciauxIds: secteurData.userIds,
    });
  };

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col px-4 pb-16 pt-8">
        <div className="flex-grow">
          <main className="my-0">
            <h1 className="text-xl text-black sm:text-2xl">
              Création du secteur
            </h1>

            <Link
              href="/dashboard/secteurs"
              className="mt-4 inline-block text-blue-600"
            >
              <span className="mb-3 mr-3 text-blue-600">←</span>
              Retour à la liste des secteurs
            </Link>

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
                            className="shadow-smsm:text-sm w-full rounded-lg border border-gray-200 p-4 pe-12 text-sm [&::-webkit-calendar-picker-indicator]:opacity-0"
                            placeholder="Please select"
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
                        (dept: { id: string; code: string; name: string }) => (
                          <div
                            key={dept.id}
                            className="grid grid-cols-5 gap-1 py-3 even:bg-gray-50 sm:grid-cols-5 sm:gap-4"
                          >
                            <dt className="px-1 text-center font-medium text-gray-900">
                              {dept.code}
                            </dt>
                            <dd className="col-span-3 px-1 text-gray-700 sm:col-span-3">
                              {dept.name}
                            </dd>
                            <dd className="px-1 text-center text-gray-700">
                              {/* delete button */}
                              <span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDept(dept.id)}
                                >
                                  {/* delete icon */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
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
                              </span>
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
                            placeholder="Selectionnez un commercial"
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
                          className="grid grid-cols-5 gap-1 py-3 even:bg-gray-50 sm:grid-cols-4 sm:gap-4"
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
                            <span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteCommercial(commercial.user.id)
                                }
                              >
                                {/* delete icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
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
                            </span>
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
                    Créer le secteur
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
