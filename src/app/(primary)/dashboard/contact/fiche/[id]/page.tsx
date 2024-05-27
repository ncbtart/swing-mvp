"use client";

import ButtonGroup from "@/app/_components/core/ButtonGroup";
import { api } from "@/trpc/react";
import { formatNumeroTelephone, isFrenchPhoneNumber, sortDays } from "@/utils";
import {
  CiviliteLabels,
  FonctionChirs,
  FonctionLabels,
  ServiceLabels,
  SurgeriesByService,
} from "@/utils/constantes";
import {
  Civilite,
  Fabricant,
  Fonction,
  Jour,
  type Product,
  Service,
  Surgery,
  type UsingSurgery,
  type EtablissementType,
} from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

export default function FicheEtablissement({
  params,
}: {
  params: { id: string };
}) {
  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const {
    data: contact,
    isPending,
    refetch,
  } = api.chirurgien.findOne.useQuery({
    id: params.id,
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
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
            <div className="relative mt-6 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
              <Image
                src="/img/logo.gif"
                alt="Swing"
                width={160}
                height={160}
                className="absolute left-6 top-6"
              />

              <h1 className="mb-12 text-center text-xl font-medium uppercase text-black sm:text-2xl">
                Fiche contact
              </h1>

              <p>
                <span className="my-8 text-xl font-bold text-blue-900">
                  {contact?.firstname} {contact?.lastname} -{" "}
                  <Link
                    href={
                      "/dashboard/etablissements/fiche/" +
                      contact?.etablissement.id
                    }
                  >
                    {contact?.etablissement.name} {contact?.etablissement.ville}{" "}
                    {contact?.etablissement.codePostal}
                  </Link>
                </span>
              </p>

              <div>
                <div className="sm:hidden">
                  <label htmlFor="Tab" className="sr-only">
                    Tab
                  </label>
                </div>

                <div className="mt-6 hidden sm:block">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                      <TabButton
                        activeIndex={tabIndex}
                        label="Informations"
                        setTabIndex={setTabIndex}
                        tabIndex={0}
                      />

                      {FonctionChirs.some((f) => f === contact?.fonction) && (
                        <TabButton
                          activeIndex={tabIndex}
                          label="Références"
                          setTabIndex={setTabIndex}
                          tabIndex={1}
                        />
                      )}
                    </nav>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                {
                  {
                    0: !editMode
                      ? contact && (
                          <ViewMode
                            contact={contact}
                            setEditMode={setEditMode}
                          />
                        )
                      : contact && (
                          <EditMode
                            contact={contact}
                            setEditMode={setEditMode}
                            refetch={refetch}
                          />
                        ),
                    1: contact && (
                      <References contact={contact} refetch={refetch} />
                    ),
                  }[tabIndex]
                }
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({
  label,
  tabIndex,
  setTabIndex,
  activeIndex,
}: {
  label: string;
  tabIndex: number;
  setTabIndex: (index: number) => void;
  activeIndex: number;
}) {
  return (
    <button
      onClick={() => setTabIndex(tabIndex)}
      className={`shrink-0 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 ${
        activeIndex == tabIndex
          ? "border-sky-500 text-sky-600"
          : "border-transparent text-gray-500"
      }`}
    >
      {label}
    </button>
  );
}

function ViewMode({
  contact,
  setEditMode,
}: {
  contact: {
    etablissement: {
      id: string;
      status: boolean;
      name: string;
      type: EtablissementType;
      isClient: boolean;
      departementId: string | null;
      adresseComp: string | null;
      adresse: string;
      codePostal: string;
      ville: string;
      telephone: string;
    };
    id: string;
    civilite: Civilite;
    fonction: Fonction;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    phone2: string | null;
    adresse: string | null;
    isDiffusion: boolean;
    service: Service;
    joursBloc: Jour[];
    joursConsult: Jour[];
  };
  setEditMode: (editMode: boolean) => void;
}) {
  return (
    <div>
      <div className="flex flex-row-reverse items-center justify-between">
        <button
          onClick={() => setEditMode(true)}
          className="text-blue-600 hover:text-blue-800"
        >
          Modifier
        </button>
      </div>

      <div className="mx-auto flow-root max-w-3xl pb-6">
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Civ.</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {CiviliteLabels[contact.civilite]}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Nom</dt>
            <dd className="text-gray-700 sm:col-span-2">{contact.lastname}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Prénom</dt>
            <dd className="text-gray-700 sm:col-span-2">{contact.firstname}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Fonction</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {FonctionLabels[contact.fonction]}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Service</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <span className="font-medium">
                {ServiceLabels[contact.service]}
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Email</dt>
            <dd className="text-gray-700 sm:col-span-2">{contact.email}</dd>
          </div>
          {contact.phone && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Tél Secretariat</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {formatNumeroTelephone(contact.phone)}
              </dd>
            </div>
          )}
          {contact.phone2 && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Tél Perso</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {formatNumeroTelephone(contact.phone2)}
              </dd>
            </div>
          )}
          {contact?.adresse && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Adresse</dt>
              <dd className="text-gray-700 sm:col-span-2">{contact.adresse}</dd>
            </div>
          )}

          {FonctionChirs.some((fonction) => fonction === contact.fonction) && (
            <>
              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Jours Bloc</dt>
                <dd className="text-gray-700 sm:col-span-2">
                  {sortDays(contact.joursBloc).map((jour) => (
                    <span className="mr-2 font-medium" key={jour}>
                      {jour}
                    </span>
                  ))}
                </dd>
              </div>

              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Jours Consult</dt>
                <dd className="text-gray-700 sm:col-span-2">
                  {sortDays(contact.joursConsult).map((jour) => (
                    <span className="mr-2 font-medium" key={jour}>
                      {jour}
                    </span>
                  ))}
                </dd>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Liste de diffusion</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <span
                className={`text-sm font-bold ${
                  contact?.isDiffusion ? "text-green-600" : "text-red-600"
                }`}
              >
                {contact.isDiffusion ? "Oui" : "Non"}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function EditMode({
  contact,
  setEditMode,
  refetch,
}: {
  contact: {
    etablissement: {
      id: string;
      status: boolean;
      name: string;
      type: EtablissementType;
      isClient: boolean;
      departementId: string | null;
      adresseComp: string | null;
      adresse: string;
      codePostal: string;
      ville: string;
      telephone: string;
    };
    id: string;
    civilite: Civilite;
    fonction: Fonction;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    phone2: string | null;
    adresse: string | null;
    isDiffusion: boolean;
    service: Service;
    joursBloc: Jour[];
    joursConsult: Jour[];
  };
  setEditMode: (editMode: boolean) => void;
  refetch: () => void;
}) {
  const [contactTemp, setContactTemp] = useState(contact);

  const [error, setError] = useState<string | null>(null);

  const mutateContact = api.chirurgien.update.useMutation({
    onSuccess: () => {
      setEditMode(false);
      refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      contactTemp.phone.length > 0 &&
      !isFrenchPhoneNumber(contactTemp.phone)
    ) {
      setError("Le numéro de téléphone est invalide");
      return;
    }

    if (
      contactTemp.phone2 &&
      contactTemp.phone2.length > 0 &&
      !isFrenchPhoneNumber(contactTemp.phone2)
    ) {
      setError("Le numéro de téléphone est invalide");
      return;
    }

    mutateContact.mutate(contactTemp);
  };

  return (
    <div>
      <div className="flex flex-row-reverse items-center justify-between">
        <button
          onClick={() => setEditMode(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          Annuler
        </button>
      </div>

      <form
        className="mx-auto flow-root max-w-2xl pb-6"
        onSubmit={handleSubmit}
      >
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Civ.</dt>
            <select
              name="civilite"
              id="civilite"
              value={contactTemp.civilite}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  civilite: e.target.value as Civilite,
                }))
              }
              className="w-full rounded-md border-gray-300 text-gray-700 sm:text-sm"
            >
              <option value={Civilite.M}>{CiviliteLabels[Civilite.M]}</option>
              <option value={Civilite.MME}>
                {CiviliteLabels[Civilite.MME]}
              </option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Nom</dt>
            <input
              type="text"
              className="w-full border-gray-200 pe-12 text-sm shadow-sm"
              value={contactTemp.lastname}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  lastname: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Prénom</dt>
            <input
              type="text"
              className="w-full border-gray-200 pe-12 text-sm shadow-sm"
              value={contactTemp.firstname}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  firstname: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Fonction</dt>
            <select
              name="fonction"
              id="fonction"
              value={contactTemp.fonction}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  fonction: e.target.value as Fonction,
                }))
              }
              className="w-full rounded-md border-gray-300 text-gray-700 sm:text-sm"
            >
              {Object.entries(Fonction).map(([key, value]) => (
                <option key={key} value={key}>
                  {FonctionLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Service</dt>
            <select
              name="service"
              id="service"
              value={contactTemp.service}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  service: e.target.value as Service,
                }))
              }
              className="w-full rounded-md border-gray-300 text-gray-700 sm:text-sm"
            >
              {Object.entries(Service).map(([key, value]) => (
                <option key={key} value={key}>
                  {ServiceLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Email</dt>
            <input
              type="email"
              className="w-full border-gray-200 pe-12 text-sm shadow-sm"
              value={contactTemp.email}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Tél Secretariat</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={contactTemp.phone}
                onChange={(e) =>
                  setContactTemp((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Tél Perso</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={contactTemp.phone2 ?? undefined}
                onChange={(e) =>
                  setContactTemp((prev) => ({
                    ...prev,
                    phone2: e.target.value,
                  }))
                }
              />
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Adresse</dt>
            <input
              type="text"
              className="w-full border-gray-200 pe-12 text-sm shadow-sm"
              value={contactTemp.adresse ?? ""}
              onChange={(e) =>
                setContactTemp((prev) => ({
                  ...prev,
                  adresse: e.target.value,
                }))
              }
            />
          </div>

          {FonctionChirs.some(
            (fonction) => fonction === contactTemp.fonction,
          ) && (
            <>
              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Jours Bloc</dt>
                <dd className="text-gray-700 sm:col-span-2">
                  <fieldset>
                    <legend className="sr-only">Checkboxes</legend>
                    <div className="flex gap-4">
                      {Object.keys(Jour).map((jour) => (
                        <label key={jour} className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-gray-300"
                            name="joursBloc"
                            value={jour}
                            checked={contactTemp.joursBloc.includes(
                              jour as Jour,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContactTemp((prev) => ({
                                  ...prev,
                                  joursBloc: [...prev.joursBloc, jour as Jour],
                                }));
                              } else {
                                setContactTemp((prev) => ({
                                  ...prev,
                                  joursBloc: prev.joursBloc.filter(
                                    (j) => j !== jour,
                                  ),
                                }));
                              }
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {jour}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </dd>
              </div>

              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Jours Consult.</dt>
                <dd className="text-gray-700 sm:col-span-2">
                  <fieldset>
                    <legend className="sr-only">Checkboxes</legend>
                    <div className="flex gap-4">
                      {Object.keys(Jour).map((jour) => (
                        <label key={jour} className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-gray-300"
                            name="joursConsult"
                            value={jour}
                            checked={contactTemp.joursConsult.includes(
                              jour as Jour,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContactTemp((prev) => ({
                                  ...prev,
                                  joursConsult: [
                                    ...prev.joursConsult,
                                    jour as Jour,
                                  ],
                                }));
                              } else {
                                setContactTemp((prev) => ({
                                  ...prev,
                                  joursConsult: prev.joursConsult.filter(
                                    (j) => j !== jour,
                                  ),
                                }));
                              }
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {jour}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </dd>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Liste de diffusion</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <fieldset>
                <legend className="sr-only">Checkboxes</legend>
                <div className="flex gap-4">
                  <label
                    htmlFor="diffusion1"
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300"
                      id="diffusion1"
                      checked={contactTemp.isDiffusion}
                      onChange={(e) => {
                        console.log(e.target.checked);
                        setContactTemp((prev) => ({
                          ...prev,
                          isDiffusion: e.target.checked,
                        }));
                      }}
                    />
                    <strong className="font-medium text-gray-900">Oui</strong>
                  </label>

                  <label
                    htmlFor="diffusion2"
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300"
                      id="diffusion2"
                      checked={!contactTemp.isDiffusion}
                      onChange={(e) =>
                        setContactTemp((prev) => ({
                          ...prev,
                          isDiffusion: !e.target.checked,
                        }))
                      }
                    />
                    <strong className="font-medium text-gray-900">Non</strong>
                  </label>
                </div>
              </fieldset>
            </dd>
          </div>
        </dl>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        <div className="mt-6 flex flex-row-reverse">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export function References({
  contact,
  refetch,
}: {
  contact: {
    etablissement: {
      id: string;
      status: boolean;
      name: string;
      type: EtablissementType;
      isClient: boolean;
      departementId: string | null;
      adresseComp: string | null;
      adresse: string;
      codePostal: string;
      ville: string;
      telephone: string;
    };
    id: string;
    civilite: Civilite;
    fonction: Fonction;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    phone2: string | null;
    adresse: string | null;
    isDiffusion: boolean;
    service: Service;
    joursBloc: Jour[];
    joursConsult: Jour[];
    references: { product: Product; surgery: Surgery }[];
    usingSurgery: UsingSurgery[];
  };
  refetch: () => void;
}) {
  const [addRefMode, setAddRefMode] = useState(false);

  const refByService = useMemo(() => {
    if (!contact) {
      return {};
    }

    const refByService = contact.references.reduce(
      (acc, ref) => {
        if (!acc[ref.surgery]) {
          acc[ref.surgery] = [];
        }

        acc[ref.surgery]?.push(ref);

        return acc;
      },
      {} as Record<string, typeof contact.references>,
    );

    return refByService;
  }, [contact]);

  const deleteRef = api.chirurgien.deleteReference.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [isTapp, setIsTapp] = useState<boolean>(false);
  const [isTep, setIsTep] = useState<boolean>(false);

  useEffect(() => {
    const usingHIC = contact.usingSurgery.find(
      (s) => s.surgery === Surgery.HIC,
    );

    if (usingHIC?.isTapp) {
      setIsTapp(true);
    }

    if (usingHIC?.isTep) {
      setIsTep(true);
    }
  }, [contact.usingSurgery]);

  const setTappMutation = api.chirurgien.setTapp.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const setTepMutation = api.chirurgien.setTep.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between">
        <div
          role="button"
          onClick={() => setAddRefMode(true)}
          className="mb-4 inline-block cursor-pointer text-blue-600"
        >
          Ajouter une reference posée
        </div>
        <div className="flex-grow"></div>

        <div className="flex flex-col items-end space-y-2">
          <div className="mt-6 flex w-full flex-row items-center justify-between space-x-4">
            <label className="block text-left text-sm font-medium text-gray-700">
              TAPP
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="switch"
                type="checkbox"
                className="peer sr-only"
                checked={isTapp}
                onChange={(e) => {
                  setIsTapp(e.target.checked);
                  setTappMutation.mutate({
                    chirurgienId: contact.id,
                    tapp: e.target.checked,
                  });
                }}
              />
              <label htmlFor="switch" className="hidden"></label>
              <div className="peer h-6 w-11 rounded-full border bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
            </label>
          </div>

          <div className="mt-6 flex w-full flex-row items-center justify-between space-x-4">
            <label className="block text-left text-sm font-medium text-gray-700">
              TEP
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="switch"
                type="checkbox"
                className="peer sr-only"
                checked={isTep}
                onChange={(e) => {
                  setIsTep(e.target.checked);
                  setTepMutation.mutate({
                    chirurgienId: contact.id,
                    tep: e.target.checked,
                  });
                }}
              />
              <label htmlFor="switch" className="hidden"></label>
              <div className="peer h-6 w-11 rounded-full border bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="my-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="text-left">
              <tr>
                {Object.values(SurgeriesByService[contact.service]).map((s) => {
                  return (
                    <th key={s} className="w-1/12 bg-gray-50 px-8 py-3">
                      {s}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              <tr>
                {Object.values(SurgeriesByService[contact.service]).map(
                  (refs, i) => (
                    <td key={i} className="w-1/12 px-6 py-4">
                      <ul>
                        {contact.usingSurgery.find((s) => s.surgery === refs)
                          ?.isUsing === false ? (
                          <li className="group flex items-center justify-between rounded-lg p-2 transition-colors duration-300 ease-in-out hover:bg-gray-100">
                            <span className="text-medium text-gray-500">
                              N/A
                            </span>
                          </li>
                        ) : (
                          refByService[refs]?.map((ref) => (
                            <li
                              key={`${ref.product.id}-${ref.surgery}`}
                              className="group flex items-center justify-between rounded-lg p-2 transition-colors duration-300 ease-in-out hover:bg-gray-100"
                            >
                              <span
                                className={`text-medium ${ref.product.fabricant === Fabricant.AUTRES ? "text-gray-500" : ""} `}
                              >
                                {ref.product.reference}
                              </span>
                              <button
                                className="text-red-500 opacity-0 transition-opacity duration-300 ease-in-out hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                                onClick={() =>
                                  deleteRef.mutate({
                                    chirurgienId: contact.id,
                                    productId: ref.product.id,
                                    surgery: ref.surgery,
                                  })
                                }
                              >
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
                            </li>
                          ))
                        )}
                      </ul>
                    </td>
                  ),
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {addRefMode && (
        <>
          <NewRefForm
            contactId={contact.id}
            setAddRefMode={setAddRefMode}
            service={contact.service}
            refetch={refetch}
          />
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
        </>
      )}
    </>
  );
}

function NewRefForm({
  contactId,
  service,
  setAddRefMode,
  refetch,
}: {
  contactId: string;
  service: Service;
  setAddRefMode: (addRefMode: boolean) => void;
  refetch: () => void;
}) {
  const [produit, setProduit] = useState<string | undefined>(undefined);

  const [type, setType] = useState<Surgery>(
    () => SurgeriesByService[service]?.[0] ?? Surgery.HIL,
  );

  const [fabricant, setFabricantFilter] = useState<Fabricant>(Fabricant.SWING);

  const { data: products } = api.reference.findAll.useQuery(
    {
      surgery: type,
      fabricant: fabricant,
    },
    {
      enabled: !!type && !!fabricant,
    },
  );

  const [usingSurgery, setUsingSurgery] = useState<boolean>(false);

  const mutateRef = api.chirurgien.addReference.useMutation({
    onSuccess: () => {
      setAddRefMode(false);
      refetch();
    },
  });

  const mutateUsingSurgery = api.chirurgien.updateUsingSurgery.useMutation({
    onSuccess: () => {
      setAddRefMode(false);
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!produit && !usingSurgery) {
      return;
    }

    if (usingSurgery) {
      mutateUsingSurgery.mutate({
        chirurgienId: contactId,
        surgery: type,
        using: !usingSurgery,
      });

      return;
    }

    const product = products?.data?.find((p) => p.reference === produit);

    if (!product) {
      return;
    }

    mutateRef.mutate({
      chirurgienId: contactId,
      productId: product.id,
      surgery: type,
    });
  };

  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="rounded-xl border border-gray-100 bg-white p-8">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex-1">
            <strong className="block font-medium text-gray-900">
              Ajouter une référence posée
            </strong>
          </div>

          <button
            className="text-gray-500 transition hover:text-gray-600"
            onClick={() => setAddRefMode(false)}
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <label htmlFor="lastname" className="sr-only">
              Chirurgie
            </label>

            <div className="relative">
              <select
                name="surgery"
                id="surgery"
                value={type}
                onChange={(e) => setType(e.target.value as Surgery)}
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                {SurgeriesByService[service].map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <ButtonGroup
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
                onActiveChange={(val) => console.log(val)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1">
            <select
              name="product"
              id="product"
              value={produit}
              onChange={(e) => setProduit(e.target.value)}
              className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
            >
              <option value="">Selectionner un produit</option>
              {products?.data?.map((product) => (
                <option key={product.id} value={product.reference}>
                  {product.reference}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1">
            <label className="mx-4 mb-2 flex items-center gap-4">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-300"
                name="usingSurgery"
                checked={usingSurgery}
                onChange={(e) => setUsingSurgery(e.target.checked)}
              />
              <span className="text-sm font-light text-gray-900">
                Ne pratique pas cette chirurgie
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!produit && !usingSurgery}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
