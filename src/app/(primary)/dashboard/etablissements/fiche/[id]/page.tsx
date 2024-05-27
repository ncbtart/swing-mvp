"use client";

import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { formatNumeroTelephone } from "@/utils";
import {
  CiviliteLabels,
  FonctionChirs,
  FonctionLabels,
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
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { isFrenchPhoneNumber } from "src/utils";
import { format } from "date-fns";
import { useSessionContext } from "@/app/_hooks/useSession";
import { useRouter, useSearchParams } from "next/navigation";
import GenericTable from "@/app/_components/core/GenericTable";

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
            <div className="relative mt-6 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
              <Image
                src="/img/logo.gif"
                alt="Swing"
                width={160}
                height={160}
                className="absolute left-6 top-6"
              />

              <h1 className="mb-12 text-center text-xl font-medium uppercase  text-black sm:text-2xl">
                Fiche etablissement
              </h1>

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
                        label="Historique"
                        setTabIndex={setTabIndex}
                        tabIndex={3}
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

    const chirByService = chirurgiens.reduce(
      (acc, chir) => {
        if (!acc[chir.service]) {
          acc[chir.service] = [];
        }

        acc[chir.service]?.push(chir);

        return acc;
      },
      {} as Record<string, typeof chirurgiens>,
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
      <div>
        {sortedKeys.map((service) => (
          <div key={service} className="mb-6 overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className="text-left">
                <tr>
                  <th className="w-1/6 whitespace-nowrap bg-indigo-50 px-4 py-3 font-medium text-gray-900">
                    {ServiceLabels[service as keyof typeof ServiceLabels]}
                  </th>
                  <th className="w-12 whitespace-nowrap bg-indigo-50 px-4  py-3 font-medium text-gray-900">
                    Civ.
                  </th>
                  <th className="w-1/4 whitespace-nowrap bg-indigo-50 px-4 py-3 font-medium text-gray-900">
                    Nom
                  </th>
                  <th className="w-1/6 whitespace-nowrap bg-indigo-50 px-4  py-3 font-medium text-gray-900">
                    Tél Sec.
                  </th>
                  <th className="w-1/6 whitespace-nowrap bg-indigo-50 px-4 py-3 font-medium text-gray-900">
                    Tél Perso
                  </th>
                  <th className="w-1/4 whitespace-nowrap bg-indigo-50 px-4  py-3 font-medium text-gray-900">
                    Email
                  </th>
                  <th className="w-1/12 whitespace-nowrap bg-indigo-50 px-4  py-3 font-medium text-gray-900"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {chirByService[service]?.map((chir) => (
                  <tr key={chir.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {FonctionLabels[chir.fonction]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {CiviliteLabels[chir.civilite]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">
                      {chir.firstname} {chir.lastname}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {formatNumeroTelephone(chir.phone)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {formatNumeroTelephone(chir.phone2 ?? "")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {chir.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
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
  const { data: historiques } = api.activite.finAllByChirurgien.useQuery({
    etablissementId: etablissement.id,
    status: true,
  });

  return (
    <div className="mt-12">
      <div className="mx-auto w-3/4">
        {historiques?.data.map((historique) => (
          <article
            key={historique.id}
            className="mb-6 rounded-xl bg-white p-4 ring ring-indigo-50 sm:p-6 lg:p-8"
          >
            <div className="flex items-start sm:gap-8">
              <div>
                <strong className="rounded border border-blue-500 bg-blue-500 px-3 py-1.5 text-[10px] font-medium text-white">
                  {RendezVousTypeLabels[historique.rendezVous.type]}
                </strong>

                <h3 className="mt-4 font-bold">
                  <Link
                    href={`/dashboard/contact/fiche/${historique.chirurgien.id}`}
                    className="hover:underline"
                  >
                    {" "}
                    {CiviliteLabels[historique.chirurgien.civilite]}{" "}
                    {historique.chirurgien.lastname}{" "}
                    {historique.chirurgien.firstname}{" "}
                  </Link>
                  <p className="mt-1 text-xs text-gray-400">
                    {historique.chirurgien.fonction} -{" "}
                    {ServiceLabels[historique.chirurgien.service]}
                  </p>
                </h3>

                <p className="mt-1 text-sm">{historique.observation}</p>

                <div className="mt-4 sm:flex sm:items-center sm:gap-2">
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

                    <p className="text-xs font-medium">
                      {format(historique.rendezVous.date, "dd/MM/yyyy")}
                    </p>
                  </div>

                  <span className="hidden sm:block" aria-hidden="true">
                    &middot;
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
