"use client";

import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { EtablissementType } from "@prisma/client";

import { isPostalCode } from "validator";

import { isFrenchPhoneNumber } from "@/utils";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEtablissement() {
  const router = useRouter();

  const [status, setStatus] = useState(false);
  const [type, setType] = useState<EtablissementType>(
    EtablissementType.HOPITAL,
  );
  const [isClient, setIsClient] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  const createMutation = api.etablissement.create.useMutation({
    onSuccess: () => {
      openPopup();
      setTitle("Etablissement créé");
      setMessage("L'établissement a bien été créé");
      router.push("/dashboard/etablissements");
    },
    onError: (error) => {
      openPopup();
      setTitle("Erreur");
      setMessage(error.message);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      status: status,
      isClient: isClient,
      adresse: formData.get("adresse") as string,
      adresseComp: formData.get("adresseComp") as string,
      codePostal: formData.get("codePostal") as string,
      ville: formData.get("ville") as string,
      telephone: formData.get("telephone") as string,
      type: formData.get("type") as EtablissementType,
    };

    if (!isFrenchPhoneNumber(data.telephone)) {
      setError("Le numéro de téléphone n'est pas valide");
      return;
    }

    if (!isPostalCode(data.codePostal, "FR")) {
      setError("Le code postal n'est pas valide");
      return;
    }

    createMutation.mutate(data);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Création d&apos;un établissement
          </h1>

          <Link
            href="/dashboard/etablissements"
            className="mt-4 inline-block text-blue-600"
          >
            <span className="mb-3 mr-3 text-blue-600">←</span>
            Retour à la liste des établissements
          </Link>

          <div className="mt-6 rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <label htmlFor="lastname" className="sr-only">
                  Raison sociale
                </label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Raison sociale"
                    name="name"
                    onInput={(e) => {
                      e.currentTarget.value =
                        e.currentTarget.value.toUpperCase();
                    }}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <span
                    className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm  ${
                      status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    onClick={() => setStatus(!status)}
                  >
                    {status ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
                <select
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as EtablissementType)}
                  className="w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                >
                  <option value={EtablissementType.HOPITAL}>
                    {EtablissementType.HOPITAL}
                  </option>
                  <option value={EtablissementType.CLINIQUE}>
                    {EtablissementType.CLINIQUE}
                  </option>
                </select>
                <fieldset className="flex items-center">
                  <legend className="sr-only">Checkboxes</legend>
                  <div className="flex gap-4">
                    <label className="mx-4 items-center gap-4">Client :</label>
                    <label
                      htmlFor="client"
                      className="flex cursor-pointer items-center gap-4"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300"
                        id="client"
                        checked={isClient}
                        onChange={() => setIsClient(true)}
                      />
                      <strong className="font-medium text-gray-900">Oui</strong>
                    </label>

                    <label
                      htmlFor="non-client"
                      className="flex cursor-pointer items-center gap-4"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300"
                        id="non-client"
                        checked={!isClient}
                        onChange={() => setIsClient(false)}
                      />
                      <strong className="font-medium text-gray-900">Non</strong>
                    </label>
                  </div>
                </fieldset>
              </div>

              {type === EtablissementType.CLINIQUE && (
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
                  <label htmlFor="lastname" className="sr-only"></label>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      name="group"
                      placeholder="Groupe"
                      required
                    />
                  </div>

                  <label htmlFor="lastname" className="sr-only"></label>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      name="central"
                      placeholder="Centrale"
                      required
                      onInput={(e) => {
                        e.currentTarget.value =
                          e.currentTarget.value.toUpperCase();
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
                <label htmlFor="lastname" className="sr-only"></label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    name="adresse"
                    placeholder="Adresse"
                    onInput={(e) => {
                      e.currentTarget.value =
                        e.currentTarget.value.toUpperCase();
                    }}
                    required
                  />
                </div>

                <label htmlFor="lastname" className="sr-only"></label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    name="adresseComp"
                    placeholder="Complément"
                    onInput={(e) => {
                      e.currentTarget.value =
                        e.currentTarget.value.toUpperCase();
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
                <label htmlFor="lastname" className="sr-only"></label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    name="codePostal"
                    placeholder="Code postal"
                    required
                  />
                </div>

                <label htmlFor="lastname" className="sr-only"></label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    name="ville"
                    placeholder="Ville"
                    required
                    onInput={(e) => {
                      e.currentTarget.value =
                        e.currentTarget.value.toUpperCase();
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
                <label htmlFor="telephone" className="sr-only"></label>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    name="telephone"
                    placeholder="Téléphone"
                    required
                    onChange={() => {
                      setError(null);
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm font-medium text-red-600">{error}</div>
              )}

              <div className="mt-4 flex flex-row-reverse">
                <button
                  type="submit"
                  className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white sm:w-auto"
                >
                  Créer l&apos;établissement
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
