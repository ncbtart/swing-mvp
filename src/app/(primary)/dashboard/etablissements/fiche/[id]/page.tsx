"use client";

import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { formatNumeroTelephone } from "@/utils";
import {
  CiviliteLabels,
  FonctionChirs,
  FonctionLabels,
  PoseLabels,
  RendezVousTypeLabels,
  ServiceLabels,
  TypeMarcheLabels,
} from "@/utils/constantes";
import {
  type Chirurgien,
  Civilite,
  EtablissementType,
  Fonction,
  Jour,
  Service,
  RoleName,
  RendezVousType,
  Surgery,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { Fragment, useEffect, useMemo, useState } from "react";
import { isFrenchPhoneNumber } from "src/utils";
import { format } from "date-fns";
import { useSessionContext } from "@/app/_hooks/useSession";
import { useRouter, useSearchParams } from "next/navigation";

interface Etablissement {
  departement:
    | ({
        secteur: {
          id: string;
          name: string;
        } | null;
      } & {
        id: string;
        name: string;
        code: string;
        secteurId: string | null;
      })
    | null;
  id: string;
  status: boolean;
  name: string;
  type: EtablissementType;
  isClient: boolean;
  departementId: string | null;
  adresse: string;
  adresseComp: string | null;
  codePostal: string;
  ville: string;
  telephone: string;
  group: string | null;
  central: string | null;
}

export default function FicheEtablissement({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();

  // Récupérer un paramètre de recherche spécifique, par exemple "id"
  const onglet = searchParams.get("o");

  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const { session } = useSessionContext();

  const isAdmin = session?.user.role.name === RoleName.ADMIN;

  useEffect(() => {
    if (onglet) setTabIndex(parseInt(onglet));
  }, [onglet]);

  const handleEditMode = (val: boolean) => {
    if (isAdmin) {
      setEditMode(val);
    }
  };

  const {
    data: etablissement,
    isPending,
    refetch,
  } = api.etablissement.findOne.useQuery(
    {
      id: params.id,
    },
    {
      enabled: !!params.id,
    },
  );

  const { data: commerciaux } = api.user.findCommerciauxBySecteur.useQuery(
    {
      secteurId: etablissement?.departement?.secteurId ?? "",
    },
    {
      enabled: !!etablissement?.departement?.secteurId,
    },
  );

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
            <div className="relative mt-2 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
              <Image
                src="/img/logo.gif"
                alt="Swing"
                width={160}
                height={160}
                className="absolute left-6 top-6"
              />

              <div className="mb-12 text-center text-xl font-medium uppercase  text-black sm:text-2xl">
                <p>
                  <span className="my-8 text-xl font-bold text-blue-900">
                    {etablissement?.name} - {etablissement?.codePostal}{" "}
                    {etablissement?.ville}
                  </span>
                </p>

                <p className="my-2 text-base">
                  Secteur :{" "}
                  <span className="text-blue-900">
                    {etablissement?.departement?.secteur?.name}
                  </span>
                  <span className="ml-20 text-gray-700 sm:col-span-2">
                    Commercial :{" "}
                    {commerciaux?.map((commercial) => (
                      <span key={commercial.id} className="text-blue-900">
                        {commercial.firstname} {commercial.lastname}
                      </span>
                    ))}
                  </span>
                </p>
              </div>

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

                      <TabButton
                        activeIndex={tabIndex}
                        label="Services"
                        setTabIndex={setTabIndex}
                        tabIndex={1}
                      />

                      {etablissement?.type === EtablissementType.HOPITAL && (
                        <TabButton
                          activeIndex={tabIndex}
                          label="AO"
                          setTabIndex={setTabIndex}
                          tabIndex={2}
                        />
                      )}

                      <TabButton
                        activeIndex={tabIndex}
                        label="Historique des rendez-vous"
                        setTabIndex={setTabIndex}
                        tabIndex={3}
                      />

                      <TabButton
                        activeIndex={tabIndex}
                        label="Tableau Avancement"
                        setTabIndex={setTabIndex}
                        tabIndex={4}
                      />
                    </nav>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                {
                  {
                    0: !editMode ? (
                      <ViewMode
                        etablissement={etablissement!}
                        setEditMode={(val) => handleEditMode(val)}
                        commerciaux={commerciaux}
                      />
                    ) : (
                      <EditMode
                        etablissement={etablissement!}
                        setEditMode={(val) => handleEditMode(val)}
                        refetch={refetch}
                      />
                    ),
                    1: <Services etablissement={etablissement!} />,
                    2: <AO etablissement={etablissement!} />,
                    3: <Historique etablissement={etablissement!} />,
                    4: <TabAvancement etablissement={etablissement!} />,
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
  const router = useRouter();

  const handleClick = () => {
    // Update the active tab index
    setTabIndex(tabIndex);

    // Construct the new URL search parameters
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("o", tabIndex.toString());

    router.push("?" + searchParams.toString());
  };

  return (
    <button
      onClick={handleClick}
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
  etablissement,
  setEditMode,
}: {
  etablissement: Etablissement;
  commerciaux:
    | {
        role: {
          name: RoleName;
        };
        firstname: string | null;
        lastname: string | null;
        id: string;
      }[]
    | undefined;
  setEditMode: (editMode: boolean) => void;
}) {
  const { session } = useSessionContext();

  const isAdmin = session?.user.role.name === RoleName.ADMIN;

  return (
    <div>
      <div className="flex flex-row-reverse items-center justify-between">
        {isAdmin && (
          <button
            onClick={() => setEditMode(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Modifier
          </button>
        )}
      </div>

      <div className="mx-auto flow-root max-w-2xl pb-6">
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Statut</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <span
                className={`whitespace-nowrap rounded-full px-2.5 py-0.5  text-sm ${
                  etablissement.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {etablissement.status ? "Actif" : "Inactif"}
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Type</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {etablissement.type}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Raison sociale</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {etablissement.name}
            </dd>
          </div>

          {etablissement.group && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Groupe</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {etablissement.group}
              </dd>
            </div>
          )}

          {etablissement.central && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Centrale</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {etablissement.central}
              </dd>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Client</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <span
                className={`text-sm font-bold ${
                  etablissement?.isClient ? "text-green-600" : "text-red-600"
                }`}
              >
                {etablissement?.isClient ? "Oui" : "Non"}
              </span>
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Adresse</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {etablissement.adresse ?? "Non renseigné"}
            </dd>
          </div>
          {etablissement.adresseComp && (
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Complément</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {etablissement.adresseComp}
              </dd>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Code postal</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {etablissement.codePostal}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Ville</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {etablissement.ville}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Téléphone</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {formatNumeroTelephone(etablissement.telephone)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function EditMode({
  etablissement,
  setEditMode,
  refetch,
}: {
  etablissement: Etablissement;
  setEditMode: (editMode: boolean) => void;
  refetch: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const { openPopup, setTitle, setMessage } = usePopup();

  const [etablissementTemp, setEtablissementTemp] =
    useState<Etablissement>(etablissement);

  const editMutation = api.etablissement.update.useMutation({
    onSuccess: () => {
      openPopup();
      setTitle("Modification réussie");
      setMessage("Les informations de l'établissement ont été modifiées");
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
      etablissementTemp.telephone.length > 0 &&
      !isFrenchPhoneNumber(etablissementTemp.telephone)
    ) {
      setError("Le numéro de téléphone n'est pas valide");
      return;
    }

    editMutation.mutate({
      id: etablissementTemp.id,
      adresse: etablissementTemp.adresse,
      adresseComp: etablissementTemp.adresseComp,
      codePostal: etablissementTemp.codePostal,
      isClient: etablissementTemp.isClient,
      name: etablissementTemp.name,
      status: etablissementTemp.status,
      telephone: etablissementTemp.telephone,
      type: etablissementTemp.type,
      ville: etablissementTemp.ville,
      group: etablissementTemp.group,
      central: etablissementTemp.central,
    });
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
      <form className="mx-auto flow-root max-w-2xl" onSubmit={handleSubmit}>
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Statut</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <span
                onClick={() =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    status: !prev.status,
                  }))
                }
                className={`cursor-pointer whitespace-nowrap rounded-full px-2.5  py-0.5 text-sm ${
                  etablissementTemp.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {etablissementTemp.status ? "Actif" : "Inactif"}
              </span>
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Type</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <select
                name="type"
                id="type"
                value={etablissementTemp.type}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    type: e.target.value as EtablissementType,
                  }))
                }
                className="w-full rounded-md border-gray-300 text-gray-700 sm:text-sm"
              >
                <option value={EtablissementType.CLINIQUE}>CLINIQUE</option>
                <option value={EtablissementType.HOPITAL}>HOPITAL</option>
              </select>
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Raison sociale</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.name}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Groupe</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.group ?? ""}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    group: e.target.value,
                  }))
                }
              />
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Centrale</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.central ?? ""}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    central: e.target.value,
                  }))
                }
              />
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Client</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <fieldset>
                <legend className="sr-only">Checkboxes</legend>
                <div className="flex gap-4">
                  <label
                    htmlFor="client"
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300"
                      id="client1"
                      checked={etablissementTemp.isClient}
                      onChange={(e) =>
                        setEtablissementTemp((prev) => ({
                          ...prev,
                          isClient: e.target.checked,
                        }))
                      }
                    />
                    <strong className="font-medium text-gray-900">Oui</strong>
                  </label>

                  <label
                    htmlFor="client2"
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300"
                      id="client2"
                      checked={!etablissementTemp.isClient}
                      onChange={(e) =>
                        setEtablissementTemp((prev) => ({
                          ...prev,
                          isClient: !e.target.checked,
                        }))
                      }
                    />
                    <strong className="font-medium text-gray-900">Non</strong>
                  </label>
                </div>
              </fieldset>
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Adresse</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.adresse}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    adresseFix: e.target.value,
                  }))
                }
              />
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Complément</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.adresseComp ?? ""}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    adresseLiv: e.target.value,
                  }))
                }
              />
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Code postal</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.codePostal}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    codePostal: e.target.value,
                  }))
                }
              />
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Ville</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.ville}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    ville: e.target.value,
                  }))
                }
              />
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Téléphone</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <input
                type="text"
                className="w-full border-gray-200 pe-12 text-sm shadow-sm"
                value={etablissementTemp.telephone}
                onChange={(e) =>
                  setEtablissementTemp((prev) => ({
                    ...prev,
                    telephone: e.target.value,
                  }))
                }
              />
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

function Services({ etablissement }: { etablissement: Etablissement }) {
  const [addChirMode, setAddChirMode] = useState(false);

  const [deleteContact, setDeleteContact] = useState<Chirurgien | null>(null);

  const { data: chirurgiens, refetch } = api.chirurgien.findAll.useQuery(
    {
      etablissementId: etablissement.id,
    },
    {
      enabled: !!etablissement.id,
    },
  );

  const { openPopup, setTitle, setMessage } = usePopup();

  const deleteMutation = api.chirurgien.delete.useMutation({
    onSuccess: async () => {
      openPopup();
      setTitle("Suppression réussie");
      setMessage("Le contact a été supprimé");
      setDeleteContact(null);
      await refetch();
    },
    onError: (error) => {
      openPopup();
      setTitle("Erreur");
      setMessage(error.message);
    },
  });

  const chirByService = useMemo(() => {
    if (!chirurgiens) {
      return {};
    }

    const chirByService = chirurgiens.data.reduce(
      (acc, chir) => {
        if (!acc[chir.service]) {
          acc[chir.service] = [];
        }

        acc[chir.service]?.push(chir);

        return acc;
      },
      {} as Record<string, typeof chirurgiens.data>,
    );

    return chirByService;
  }, [chirurgiens]);

  const sortedKeys = useMemo(() => {
    if (chirByService) {
      // Récupérer les clés de l'objet chirByService
      const keys = Object.keys(chirByService);

      // Trier les clés alphabétiquement en utilisant sort()
      keys.sort();

      return keys;
    }

    return [];
  }, [chirByService]);

  const handleDeleteChirurgien = () => {
    if (deleteContact) {
      deleteMutation.mutate({
        id: deleteContact.id,
      });
    }
  };

  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between">
        <div
          role="button"
          onClick={() => setAddChirMode(true)}
          className="mb-4 inline-block cursor-pointer text-blue-600"
        >
          Ajouter un contact
        </div>
      </div>
      {chirurgiens && chirurgiens.total > 0 ? (
        <div>
          {sortedKeys.map((service) => (
            <div key={service}>
              <h4 className="mb-3 rounded-lg bg-blue-50 p-4 font-bold text-blue-900">
                {ServiceLabels[service as keyof typeof ServiceLabels]}
              </h4>

              {chirByService[service]?.map((chir) => (
                <article
                  key={chir.id}
                  className="mb-6 rounded-xl bg-white p-2 ring ring-indigo-50 sm:p-4 lg:p-6"
                >
                  <div className="flex items-center justify-between sm:gap-8">
                    <div>
                      <h3 className="mt-4 font-bold">
                        <span className="flex flex-row items-center space-x-4">
                          <Link
                            href={`/dashboard/contact/fiche/${chir.id}`}
                            className="hover:underline"
                          >
                            {CiviliteLabels[chir.civilite]} {chir.lastname}{" "}
                            {chir.firstname}
                          </Link>
                          <p className="mt-1 text-xs text-gray-400">
                            {chir.fonction} - {ServiceLabels[chir.service]}
                          </p>
                        </span>
                      </h3>

                      <div className="mt-4 sm:flex sm:items-center sm:gap-2">
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                              clipRule="evenodd"
                            />
                          </svg>

                          <p className="text-xs font-medium">
                            {formatNumeroTelephone(chir.phone)}
                          </p>

                          {chir?.phone2 && (
                            <>
                              <span
                                className="mx-4 hidden sm:block"
                                aria-hidden="true"
                              >
                                &middot;
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              <p className="text-xs font-medium">
                                {formatNumeroTelephone(chir.phone2)}
                              </p>
                            </>
                          )}

                          {chir?.email && (
                            <>
                              <span
                                className="mx-4 hidden sm:block"
                                aria-hidden="true"
                              >
                                &middot;
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M17.834 6.166a8.25 8.25 0 1 0 0 11.668.75.75 0 0 1 1.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0 1 21.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 1 1-.82-6.26V8.25a.75.75 0 0 1 1.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 0 0-2.416-5.834ZM15.75 12a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              <a
                                href={`mailto:${chir.email}`}
                                className="text-xs font-medium hover:underline"
                              >
                                {chir.email}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-center">
                        <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                          <Link
                            href={`/dashboard/contact/fiche/${chir.id}`}
                            className="inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative"
                            title="Edit Chirurgien"
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
                            title="Delete Chirurgien"
                            onClick={() => setDeleteContact(chir)}
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
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {chirurgiens && chirurgiens.total === 0 && (
            <div className="flex h-96 flex-col items-center justify-center">
              <Image
                src="/img/no_contact.svg"
                alt="No data"
                width={300}
                height={300}
              />
            </div>
          )}
        </>
      )}
      {addChirMode && (
        <>
          <NewPersonnelForm
            etablissementId={etablissement.id}
            setAddChirMode={setAddChirMode}
            refetch={refetch}
          />
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
        </>
      )}
      {deleteContact && (
        <>
          <div
            role="alert"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="rounded-xl border border-gray-100 bg-white p-8">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <strong className="block font-medium text-gray-900">
                    Supprimer le contact
                  </strong>

                  <p className="mt-2 text-sm text-gray-700">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <strong>
                      {deleteContact.firstname} {deleteContact.lastname}
                    </strong>
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                      onClick={() => setDeleteContact(null)}
                    >
                      <span className="text-sm">Annuler</span>
                    </button>

                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                      onClick={handleDeleteChirurgien}
                    >
                      <span className="text-sm">Valider</span>
                    </button>
                  </div>
                </div>

                <button
                  className="text-gray-500 transition hover:text-gray-600"
                  onClick={() => setDeleteContact(null)}
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
    </>
  );
}

function NewPersonnelForm({
  etablissementId,
  setAddChirMode,
  refetch,
}: {
  etablissementId: string;
  setAddChirMode: (val: boolean) => void;
  refetch: () => void;
}) {
  const [fonction, setFonction] = useState<Fonction>(Fonction.CHIR);

  const { openPopup, setTitle, setMessage } = usePopup();

  const createMutation = api.chirurgien.create.useMutation({
    onSuccess: () => {
      openPopup();
      setTitle("Contact ajouté");
      setMessage("Le contact a été ajouté avec succès");
      setAddChirMode(false);
      refetch();
    },
    onError: (error) => {
      openPopup();
      setTitle("Erreur");
      setMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const joursBloc = Array.from(formData.getAll("joursBloc")) as Jour[];

    const joursConsult = Array.from(formData.getAll("joursConsult")) as Jour[];

    const phone = formData.get("phone") as string;

    const phone2 = formData.get("phone2") as string;

    if (phone && !isFrenchPhoneNumber(phone)) {
      openPopup();
      setTitle("Erreur");
      setMessage("Le numéro de téléphone n'est pas valide");
      return;
    }

    if (phone2 && !isFrenchPhoneNumber(phone2)) {
      openPopup();
      setTitle("Erreur");
      setMessage("Le numéro de téléphone 2 n'est pas valide");
      return;
    }

    createMutation.mutate({
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      phone,
      phone2: formData.get("phone2")
        ? (formData.get("phone2") as string)
        : undefined,
      email: formData.get("email") as string,
      fonction,
      service: formData.get("service") as Service,
      etablissementId,
      civilite: formData.get("civilite") as Civilite,
      isDiffusion: false,
      joursBloc,
      joursConsult,
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
              Nouveau Contact
            </strong>
          </div>

          <button
            className="text-gray-500 transition hover:text-gray-600"
            onClick={() => setAddChirMode(false)}
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
              Sevice
            </label>

            <div className="relative">
              <select
                name="service"
                id="civilite"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value={Service.CHIR_DIGESTIF}>
                  {ServiceLabels[Service.CHIR_DIGESTIF]}
                </option>
                <option value={Service.CHIR_GINECO}>
                  {ServiceLabels[Service.CHIR_GINECO]}
                </option>
                <option value={Service.CHIR_UROLOGIE}>
                  {ServiceLabels[Service.CHIR_UROLOGIE]}
                </option>
                <option value={Service.PHARMACIE}>
                  {ServiceLabels[Service.PHARMACIE]}
                </option>
                <option value={Service.X_BLOC}>
                  {ServiceLabels[Service.X_BLOC]}
                </option>
              </select>
            </div>

            <label htmlFor="lastname" className="sr-only">
              Fonction
            </label>

            <div className="relative">
              <select
                name="fonction"
                value={fonction}
                onChange={(e) => setFonction(e.target.value as Fonction)}
                id="fonction"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value={Fonction.CHIR}>
                  {FonctionLabels[Fonction.CHIR]}
                </option>
                <option value={Fonction.PROFESSEUR}>
                  {FonctionLabels[Fonction.PROFESSEUR]}
                </option>
                <option value={Fonction.CHEF_DE_SERVICE}>
                  {FonctionLabels[Fonction.CHEF_DE_SERVICE]}
                </option>
                <option value={Fonction.PRACTICIEN}>
                  {FonctionLabels[Fonction.PRACTICIEN]}
                </option>
                <option value={Fonction.IBODE}>
                  {FonctionLabels[Fonction.IBODE]}
                </option>
                <option value={Fonction.PHARM_ADJOINT}>
                  {FonctionLabels[Fonction.PHARM_ADJOINT]}
                </option>
                <option value={Fonction.PHARM_GERANT}>
                  {FonctionLabels[Fonction.PHARM_GERANT]}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <label htmlFor="lastname" className="sr-only">
              Civilité
            </label>

            <div className="relative">
              <select
                name="civilite"
                id="civilite"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                <option value={Civilite.M}>{CiviliteLabels[Civilite.M]}</option>
                <option value={Civilite.MME}>
                  {CiviliteLabels[Civilite.MME]}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <label htmlFor="lastname" className="sr-only">
              Prénom
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Prénom"
                name="firstname"
                required
              />
            </div>

            <label htmlFor="lastname" className="sr-only">
              Nom
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Nom"
                name="lastname"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <label htmlFor="lastname" className="sr-only">
              Tél. Secr.
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Tél. Secr."
                name="phone"
              />
            </div>

            <label htmlFor="lastname" className="sr-only">
              Tél. Pers.
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Tél. Perso"
                name="phone2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <label htmlFor="lastname" className="sr-only">
              Email
            </label>

            <div className="relative">
              <input
                type="email"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Email"
                name="email"
                required
              />
            </div>
          </div>

          {FonctionChirs.some((fc) => fc === fonction) && (
            <div className="rounded-lg border border-gray-200 p-2">
              <div className="mb-4 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <fieldset className="col-span-2">
                  <legend className="sr-only">Checkboxes</legend>
                  <div className="flex gap-4">
                    <label className="ml-2 mr-6 items-center text-pretty text-sm text-gray-700">
                      Jours Bloc :
                    </label>

                    {Object.keys(Jour).map((jour) => (
                      <label key={jour} className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-gray-300"
                          name="joursBloc"
                          value={jour}
                        />
                        <span className="font-medium text-gray-900">
                          {jour}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <fieldset className="col-span-2">
                  <legend className="sr-only">Checkboxes</legend>
                  <div className="flex gap-4">
                    <label className="ml-2 mr-4 items-center text-pretty text-sm text-gray-700">
                      Jours Cons. :
                    </label>

                    {Object.keys(Jour).map((jour) => (
                      <label key={jour} className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-gray-300"
                          name="joursConsult"
                          value={jour}
                        />
                        <span className="font-medium text-gray-900">
                          {jour}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-row-reverse">
            <button
              type="submit"
              className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white sm:w-auto"
            >
              Créer le contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AO({ etablissement }: { etablissement: Etablissement }) {
  const { data: sources } =
    api.etablissement.findSourcesEtabablissement.useQuery(
      {
        id: etablissement.id,
      },
      {
        enabled: !!etablissement.id,
      },
    );

  return (
    <div className="mt-12">
      <div className="mx-auto w-3/4">
        {sources?.map((source, index) => (
          <>
            <div key={source.id} className="mb-16">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Type d&apos;AO :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{source.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Nom de l&apos;AO :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{source.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Numéro de marché :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{source.numero}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Date de début :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {source.dateDebut
                      ? format(new Date(source.dateDebut), "dd/MM/yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Date de fin :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {source.dateFin
                      ? format(new Date(source.dateFin), "dd/MM/yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Numéro de consultation :
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {source.consultation}
                  </p>
                </div>
                {source.objet && source.objet.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">Objet :</p>
                    <p className="mt-2 text-sm text-gray-700">{source.objet}</p>
                  </div>
                )}
              </div>

              {source.marche.map((marche) =>
                marche.lot.map((lot) => (
                  <div
                    key={lot.id}
                    className="mt-6 overflow-x-auto rounded-lg border"
                  >
                    <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                      <thead className="text-left">
                        <tr>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4 py-3 font-medium text-gray-900">
                            {TypeMarcheLabels[marche.type]}
                          </th>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4 py-3 font-medium text-gray-900">
                            N° Lot
                          </th>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4 py-3 font-medium text-gray-900">
                            Nom Lot
                          </th>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4 py-3 font-medium text-gray-900">
                            Reference
                          </th>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4  py-3 font-medium text-gray-900">
                            Tarif
                          </th>
                          <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4  py-3 font-medium text-gray-900">
                            Ventes
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {lot.productLot.map((produit) => (
                          <tr key={produit?.modelId ?? produit.productId}>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900"></td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                              {lot.numero}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                              {lot.name}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                              {produit.model?.name ??
                                produit.product?.reference}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                              {produit.prix
                                ? produit.prix?.toFixed(2) + " €"
                                : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                              N/A
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )),
              )}
            </div>
            {index < sources.length - 1 && (
              <hr className="my-8 border-gray-200" />
            )}
          </>
        ))}
      </div>
    </div>
  );
}

function Historique({ etablissement }: { etablissement: Etablissement }) {
  const [chirId, setChirId] = useState<string | undefined>();

  const { data: chirurgiens } = api.chirurgien.findAll.useQuery({
    etablissementId: etablissement.id,
  });

  const { data: historiques, isPending } =
    api.activite.finAllByChirurgien.useQuery({
      etablissementId: etablissement.id,
      chirurgienId: chirId,
      status: true,
      order: "desc",
    });

  return (
    <div className="mt-12">
      <div className="mx-auto w-3/4">
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
          <>
            <div className="my-4 flex items-center justify-end space-x-4">
              {chirurgiens && chirurgiens.total > 0 && (
                <select
                  className="w-48 rounded-md p-2 shadow-sm dark:border-gray-700"
                  onChange={(e) => setChirId(e.target.value)}
                >
                  <option value="">Contact</option>
                  {chirurgiens?.data?.map((chirurgien) => (
                    <option key={chirurgien.id} value={chirurgien.id}>
                      {CiviliteLabels[chirurgien.civilite]}{" "}
                      {chirurgien.lastname} {chirurgien.firstname}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {historiques && historiques?.total > 0 ? (
              <>
                {historiques?.data.map((historique, index) => {
                  let color = "border-blue-500 bg-blue-500";

                  if (historique.rendezVous.type === RendezVousType.ESSAI) {
                    color === "border-green-500 bg-green-500";
                  } else {
                    switch (historique.chirurgien.service) {
                      case Service.CHIR_DIGESTIF:
                        color = "border-blue-500 bg-blue-500";
                        break;
                      case Service.CHIR_UROLOGIE:
                        color = "border-red-400 bg-red-400";
                        break;
                      case Service.CHIR_GINECO:
                        color = "border-amber-400 bg-amber-400";
                        break;
                      case Service.PHARMACIE:
                        color = "border-purple-400 bg-purple-400";
                        break;
                      case Service.X_BLOC:
                        color = "border-neutral-400 bg-neutral-400";
                        break;
                      default:
                        break;
                    }
                  }

                  return (
                    <article
                      key={`${historique.id}_${index}`}
                      className="mb-6 rounded-xl bg-white p-4 ring ring-indigo-50 sm:p-6 lg:p-8"
                    >
                      <div className="flex items-start sm:gap-8">
                        <div className="w-full ">
                          <div className="flex flex-row space-x-4">
                            <strong
                              className={`rounded border ${color} px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white`}
                            >
                              {RendezVousTypeLabels[historique.rendezVous.type]}
                            </strong>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              <p className="text-sm font-medium">
                                {format(
                                  historique.rendezVous.date,
                                  "dd/MM/yyyy",
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-28">
                            <h3 className="font-bold">
                              <Link
                                href={`/dashboard/contact/fiche/${historique.chirurgien.id}`}
                                className="hover:underline"
                              >
                                {CiviliteLabels[historique.chirurgien.civilite]}{" "}
                                {historique.chirurgien.lastname}{" "}
                                {historique.chirurgien.firstname}{" "}
                              </Link>
                              <p className="mt-1 text-xs text-gray-400">
                                {historique.chirurgien.fonction} -{" "}
                                {ServiceLabels[historique.chirurgien.service]}
                              </p>
                            </h3>

                            <div className="col-span-2 mb-4">
                              {historique.rendezVous.type ===
                              RendezVousType.ESSAI ? (
                                <>
                                  {historique.rendezVous.ModelEssaiRendezVous.map(
                                    (model, index) => (
                                      <div
                                        key={`${model.id}_${index}`}
                                        className={`flex flex-col rounded-lg border border-blue-200 p-4 text-sm ${index > 0 && "mt-2"}`}
                                      >
                                        <div className="mb-4 space-x-4">
                                          <span className="whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-700">
                                            {model.done ? "Posé" : "Non posé"}
                                          </span>

                                          {model.done && (
                                            <span className="whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-700">
                                              {model.validation
                                                ? "Validé"
                                                : "Non validé"}
                                            </span>
                                          )}
                                        </div>
                                        <p>
                                          <span className="font-bold">
                                            {model.model.name}
                                            {!!model.pose && (
                                              <span className="ml-2 text-xs uppercase text-gray-400">
                                                {PoseLabels[model.pose]}
                                              </span>
                                            )}{" "}
                                            :{" "}
                                          </span>

                                          <span className="ml-2">
                                            {model.observation ??
                                              "Aucune observation"}
                                          </span>
                                        </p>

                                        {model.schedule && (
                                          <p className="mt-2 text-sm font-medium text-red-600">
                                            Date à programmer !
                                          </p>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </>
                              ) : (
                                <p className="rounded-lg border border-blue-200 p-4 text-sm">
                                  {historique.observation}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 sm:flex sm:items-center sm:gap-2">
                            <span className="text-sm">
                              Prochain rendez-vous :
                            </span>
                            {historique.rendezVous.nextRendezVous.length > 0 ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="size-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                  />
                                </svg>

                                {historique.rendezVous.nextRendezVous.map(
                                  (rdv, index) => (
                                    <Fragment key={rdv.id}>
                                      <span className="whitespace-nowrap rounded-full bg-green-100 px-2.5 py-0.5 text-sm text-green-700">
                                        {RendezVousTypeLabels[rdv.type]}
                                      </span>

                                      <p className="text-xs font-medium">
                                        {format(rdv.date, "dd/MM/yyyy")}
                                      </p>

                                      {rdv.type === RendezVousType.ESSAI && (
                                        <p className="text-sm font-bold">
                                          {rdv?.ModelEssaiRendezVous?.map(
                                            (model, index) => (
                                              <span
                                                key={index}
                                                className={`text-sm font-medium ${index === 0 && "ml-2"}`}
                                              >
                                                {model.model.name}
                                                {!!model.pose && (
                                                  <span className="ml-2 text-xs text-gray-400">
                                                    {model.pose}
                                                  </span>
                                                )}{" "}
                                                {index <
                                                  (rdv?.ModelEssaiRendezVous
                                                    ?.length ?? 0) -
                                                    1 && (
                                                  <span className="text-sm font-medium">
                                                    ,{" "}
                                                  </span>
                                                )}
                                              </span>
                                            ),
                                          )}
                                        </p>
                                      )}

                                      {index <
                                        historique.rendezVous.nextRendezVous
                                          .length -
                                          1 && (
                                        <span
                                          className="hidden sm:block"
                                          aria-hidden="true"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-2"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                            />
                                          </svg>
                                        </span>
                                      )}
                                    </Fragment>
                                  ),
                                )}
                              </>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </>
            ) : (
              <>
                <div className="flex h-96 flex-col items-center justify-center">
                  <Image
                    src="/img/to_do.svg"
                    alt="No data"
                    width={450}
                    height={450}
                  />
                  <p className="mt-12 text-sm text-gray-500 ">
                    Aucun historique pour le moment
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabAvancement({ etablissement }: { etablissement: Etablissement }) {
  const { data: avancements } = api.etablissement.avancement.useQuery({
    id: etablissement.id,
  });

  const sortedChir = useMemo(() => {
    if (!avancements) return [];

    return avancements.sort((a, b) => {
      if (a.chirurgien.service < b.chirurgien.service) return -1;
      if (a.chirurgien.service > b.chirurgien.service) return 1;
      return 0;
    });
  }, [avancements]);


  function getColourAvancement(avancementChir: number) {
    switch (avancementChir) {
      case 0:
        return "";
      case 1:
        return "";
      case 2:
        return "bg-green-200";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-600";
      default:
        return "";
    }
  }

  return (
    <div className="mt-12">
      <div className="mx-auto">
        <div>
          <div>
            <table className="w-full table-auto border-collapse divide-gray-200  text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-green-600 px-4 py-2">
                    Chirurgien utilisateur
                  </td>
                  <td className="border border-gray-400 bg-green-400 px-4 py-2">
                    Chirurgien vu essai réalisé
                  </td>
                  <td className="border border-gray-400 bg-green-200 px-4 py-2">
                    Chirurgien vu essai non réalisé
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    Chirurgien non rencontré
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-green-600 px-4 py-2">
                    Réf validée et utilisée
                  </td>
                  <td className="border border-gray-400 bg-green-400 px-4 py-2">
                    Réf validée fiche d&apos;essai jointe
                  </td>
                  <td className="border border-gray-400 bg-green-200 px-4 py-2">
                    Réf essai programmé
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    N/A Technique non pratiquée
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    NCP Ne Change Pas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="my-6 overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className="text-left">
                <tr>
                  <th className="w-1/12 bg-gray-50 px-8 py-3">Spécialité</th>
                  <th className="w-1/12 bg-gray-50 px-8 py-3">Chirurgien</th>
                  {Object.values(Surgery).map((s) => {
                    return (
                      <th key={s} className="w-1/12 bg-gray-50 px-8 py-3">
                        {s}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sortedChir.map((chir) => (
                  <tr key={chir.chirurgien.id}>
                    <td className="border border-gray-100 bg-gray-50 px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {ServiceLabels[chir.chirurgien.service]}
                      </p>
                    </td>
                    <td
                      className={`border border-gray-100 px-6 py-4 ${getColourAvancement(chir.avancementChir)}`}
                    >
                      <Link
                        className="text-xs text-gray-900 hover:underline"
                        href={`/dashboard/contact/fiche/${chir.chirurgien.id}`}
                      >
                        {CiviliteLabels[chir.chirurgien.civilite]}{" "}
                        {chir.chirurgien.lastname} {chir.chirurgien.firstname}
                      </Link>
                    </td>

                    {Object.values(Surgery).map((s) => {
                      const avancement = chir.surgeries.find(
                        (a) => a.surgery === s,
                      );

                      let color = "bg-gray-100";
                      let text;

                      if (!avancement) {
                        return (
                          <td
                            key={s}
                            className={`border border-gray-100 px-6 py-4 ${color}`}
                          ></td>
                        );
                      }

                      text = avancement.products
                        .map((p) => p.reference)
                        .join(", ");

                      switch (avancement.avancement) {
                        case 0:
                          text = "N/A";
                          color = "";
                          break;
                        case 1:
                          color = "";
                          break;
                        case 2:
                          color = "bg-green-200";
                          break;
                        case 3:
                          color = "bg-green-400";
                          break;
                        case 4:
                          color = "bg-green-600";
                          break;

                        default:
                          break;
                      }

                      return (
                        <td
                          key={s}
                          className={`border border-gray-100 px-3 py-2 ${color}`}
                        >
                          <p className="text-center text-xs text-gray-900">
                            {text}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
