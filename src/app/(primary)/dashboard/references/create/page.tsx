"use client";

import ButtonGroup from "@/app/_components/core/ButtonGroup";
import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { Fabricant, Surgery } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CreateReference() {
  const router = useRouter();

  const [fabricantFilter, setFabricantFilter] = useState<Fabricant>(
    Fabricant.SWING,
  );

  const [surgeryFilter, setSurgeryFilter] = useState<Surgery>();

  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [models, setModels] = useState<{ id?: string; name: string }[]>([]);

  const surgeriesRef = useRef<HTMLSelectElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  const createMutation = api.reference.create.useMutation({
    onSuccess: () => {
      setTitle("Produit créé avec succès");
      setMessage("Le produit a été crée avec succès");
      openPopup();
      router.push("/dashboard/references");
    },
    onError: () => {
      setTitle("Erreur");
      setMessage("Une erreur s'est produite lors de la création du produit");
      openPopup();
    },
  });

  const handleAddShirugie = () => {
    if (surgeryFilter === undefined) {
      return;
    }

    setSurgeries((prev) => {
      if (prev.includes(surgeryFilter)) {
        return prev;
      }

      return [...prev, surgeryFilter];
    });

    setSurgeryFilter(undefined);
    if (surgeriesRef.current) {
      surgeriesRef.current.value = "";
    }
  };

  const handleAddModel = () => {
    if (!modelRef.current) {
      return;
    }

    const name = modelRef.current.value;

    if (name === "") {
      return;
    }

    setModels((prev) => {
      if (prev.some((m) => m.name === name)) {
        return prev;
      }

      return [...prev, { name }];
    });

    modelRef.current.value = "";
  };

  const handleDeleteSurgery = (surgery: Surgery) => {
    setSurgeries((prev) => prev.filter((s) => s !== surgery));
  };

  const handleDeleteModel = (modelName: string) => {
    setModels((prev) => prev.filter((m) => m.name !== modelName));
  };

  const handleActiveChange = (activeLabel: string) => {
    console.log(`Bouton actif : ${activeLabel}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const body = {
      reference: formData.get("reference"),
    };

    createMutation.mutate({
      reference: body.reference as string,
      surgeries,
      fabricant: fabricantFilter,
      models: models.map((m) => m.name),
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col px-4 pb-16 pt-8">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl text-black sm:text-2xl">
            Création d&apos;une référence produit
          </h1>

          <Link
            href="/dashboard/references"
            className="mt-4 inline-block text-blue-600"
          >
            <span className="mb-3 mr-3 text-blue-600">←</span>
            Retour à la liste des références
          </Link>

          <div className="mt-6 rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <label htmlFor="lastname" className="sr-only">
                  Référence
                </label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Référence"
                    name="reference"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <label htmlFor="lastname" className="sr-only">
                  Fabricant
                </label>

                <div>
                  <ButtonGroup
                    activeIndex={fabricantFilter === Fabricant.SWING ? 0 : 1}
                    buttons={[
                      {
                        label: "Swing",
                        onClick: () => setFabricantFilter(Fabricant.SWING),
                      },

                      {
                        label: "Autres",
                        onClick: () => setFabricantFilter(Fabricant.AUTRES),
                      },
                    ]}
                    onActiveChange={handleActiveChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="mt-3 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
                  <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-5">
                    <h6 className="col-span-2 self-center font-medium">
                      Chirugie
                    </h6>

                    <div className="col-span-2">
                      <select
                        value={surgeryFilter}
                        ref={surgeriesRef}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            return setSurgeryFilter(undefined);
                          }

                          setSurgeryFilter(e.target.value as Surgery);
                        }}
                        className="w-full rounded-md border-gray-200 p-2.5 pe-14 shadow-sm sm:text-sm"
                        style={
                          surgeryFilter === undefined
                            ? {
                                color:
                                  "rgb(156 163 175 / var(--tw-border-opacity));",
                              }
                            : {}
                        }
                      >
                        <option value={""}>Selectionner ...</option>
                        {Object.entries(Surgery).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        onClick={handleAddShirugie}
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
                    {surgeries.map((surgery: Surgery) => (
                      <div
                        key={surgery}
                        className="grid grid-cols-2 gap-1 py-3 even:bg-gray-50 sm:col-span-2 sm:gap-4"
                      >
                        <dt className="px-1 text-center font-medium text-gray-900">
                          {surgery}
                        </dt>

                        <dd className="px-1 text-center text-gray-700">
                          <button
                            className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                            title="Delete Departement"
                            onClick={() => handleDeleteSurgery(surgery)}
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
                {fabricantFilter === Fabricant.SWING && (
                  <div className="mt-3 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
                    <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-5">
                      <h6 className="col-span-2 self-center font-medium">
                        Models
                      </h6>

                      <div className="col-span-2">
                        <input
                          type="text"
                          ref={modelRef}
                          className="w-full rounded-lg border border-gray-200 p-4 pe-12 text-sm shadow-sm sm:text-sm [&::-webkit-calendar-picker-indicator]:opacity-0"
                          placeholder="Ajouter ..."
                        />
                      </div>

                      <div className="flex items-center justify-center">
                        <button
                          onClick={handleAddModel}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          <span className="text-sm">Ajouter</span>
                        </button>
                      </div>
                    </div>
                    <dl className="-mb-3 divide-y divide-gray-100 text-sm">
                      {models.map((model: { id?: string; name: string }) => (
                        <div
                          key={model.name}
                          className="grid grid-cols-2 gap-1 py-3 even:bg-gray-50 sm:col-span-2 sm:gap-4"
                        >
                          <dt className="px-1 text-center font-medium text-gray-900">
                            {model.name}
                          </dt>

                          <dd className="px-1 text-center text-gray-700">
                            <button
                              className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                              title="Delete Departement"
                              onClick={() => handleDeleteModel(model.name)}
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
                )}
              </div>

              <div className="mt-4 flex flex-row-reverse">
                <button
                  type="submit"
                  className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white sm:w-auto"
                >
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
