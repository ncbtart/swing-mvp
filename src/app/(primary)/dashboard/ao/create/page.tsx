"use client";

import { format } from "date-fns";

import ButtonGroup from "@/app/_components/core/ButtonGroup";
import DatePickerComponent from "@/app/_components/core/DatePicker";
import { usePannierAo } from "@/app/_hooks/usePannierAo";
import { api } from "@/trpc/react";
import {
  AttributionLabels,
  SourceLabel,
  SurgeriesByTypeMarche,
  TypeMarcheLabels,
} from "@/utils/constantes";
import {
  type Etablissement,
  SourceAO,
  TypeMarche,
  type Surgery,
  Fabricant,
  Attribution,
  EtablissementType,
} from "@prisma/client";
import Image from "next/image";

import type { Lot } from "@/app/_hooks/usePannierAo";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAo() {
  const [step, setStep] = useState(0);

  const { form, clearLot, lot } = usePannierAo();

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <div className="relative mt-6 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
            <h1 className="text-center text-xl font-medium uppercase text-black sm:text-2xl">
              Création Appel d&apos;Offre
            </h1>
            <Image
              src="/img/logo.gif"
              alt="Swing"
              width={160}
              height={160}
              className="absolute left-6 top-6"
            />

            <div className="mt-12">
              <h2 className="sr-only">Steps</h2>

              <div>
                <ol className="grid grid-cols-1 divide-x divide-gray-100 overflow-hidden rounded-lg border border-gray-100 text-sm text-gray-500 sm:grid-cols-3">
                  <li
                    className={`relative flex cursor-pointer items-center justify-center gap-2 p-4 ${step === 0 ? "bg-blue-100 text-blue-500" : "hover:bg-gray-50"}`}
                    onClick={() => setStep(0)}
                  >
                    <svg
                      className="size-7 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>

                    <p className="leading-none">
                      <strong className="block font-medium">
                        Informations
                      </strong>
                    </p>
                  </li>

                  <li
                    className={`relative flex cursor-pointer items-center justify-center gap-2 p-4 ${step === 1 ? "bg-blue-100 text-blue-500" : "hover:bg-gray-50"}`}
                    onClick={() => {
                      if (form.id) setStep(1);
                    }}
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
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>

                    <p className="leading-none">
                      <strong className="block font-medium">
                        {lot.id ? "Modifier Lot" : "Nouveau Lot"}
                      </strong>
                    </p>
                  </li>

                  <li
                    className={`relative flex cursor-pointer items-center justify-center gap-2 p-4 ${step === 2 ? "bg-blue-100 text-blue-500" : "hover:bg-gray-50"}`}
                    onClick={() => {
                      if (form.id) {
                        setStep(2);
                        clearLot();
                      }
                    }}
                  >
                    <svg
                      className="size-7 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>

                    <p className="leading-none">
                      <strong className="block font-medium"> Recap </strong>
                    </p>
                  </li>
                </ol>
              </div>
            </div>

            {step === 0 && <EtablissementStep setStep={setStep} />}

            {step === 1 && <LotsStep setStep={setStep} />}

            {step === 2 && <RecapStep setStep={setStep} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function EtablissementStep({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: departements } = api.departement.findAll.useQuery();

  const { data: etablissements } = api.etablissement.findAll.useQuery({
    search: deptFilter,
    etablissementType: EtablissementType.HOPITAL,
  });

  const {
    etablissements: etablissementsSelected,
    addEtablissement,
    removeEtablissement,
    createAo,
    updateAo,
    form,
    setForm,
    aoIsPending,
  } = usePannierAo();

  const handleAddEtablissement = () => {
    if (!inputRef.current) return;

    const etablissement = etablissements?.data.find(
      (etablissement) => etablissement.name === inputRef.current?.value,
    );

    if (!etablissement) return;

    addEtablissement(etablissement);

    inputRef.current.value = "";
  };

  const handleDeleteEtablissement = (id: Etablissement["id"]) => {
    const etablissement = etablissementsSelected.find(
      (etablissement) => etablissement.id === id,
    );

    if (!etablissement) return;

    removeEtablissement(etablissement);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (form.id) {
        updateAo();
        setStep(1);
      } else {
        createAo();
        setStep(1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-12">
      {aoIsPending ? (
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
        <form className="mx-auto mt-6 w-3/4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="source"
                className="block text-sm font-medium text-gray-900"
              >
                Type d&apos;AO
              </label>

              <select
                name="source"
                id="source"
                value={form.source}
                required
                onChange={(e) =>
                  setForm({ ...form, source: e.target.value as SourceAO })
                }
                className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
              >
                {Object.values(SourceAO).map((source) => (
                  <option key={source} value={source}>
                    {SourceLabel[source]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900"
              >
                Nom de l&apos;AO
              </label>
              <input
                name="nameSource"
                value={form.name}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                type="text"
                placeholder="Nom de la Source"
                className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <DatePickerComponent
                label="Date de début"
                selectedDate={form.dateDebut ?? ""}
                onDateChange={(date) => setForm({ ...form, dateDebut: date })}
              />
            </div>

            <div>
              <DatePickerComponent
                label="Date de fin"
                selectedDate={form.dateFin ?? ""}
                onDateChange={(date) => setForm({ ...form, dateFin: date })}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Num. Marché"
                className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                value={form.numero}
                required
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Num. Consult."
                className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                value={form.consultation}
                required
                onChange={(e) =>
                  setForm({ ...form, consultation: e.target.value })
                }
              />
            </div>

            <textarea
              placeholder="Objet"
              className="col-span-2 mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
              value={form.objet}
              onChange={(e) => setForm({ ...form, objet: e.target.value })}
            />

            <div className="col-span-2 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
              <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-6">
                <h6 className="col-span-2 self-center font-medium">
                  Etablissement associés :
                </h6>

                <select
                  name="etablissement"
                  id="etablissement"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                >
                  {departements?.map((departement) => (
                    <option key={departement.id} value={departement.code}>
                      {departement.code} - {departement.name}
                    </option>
                  ))}
                </select>

                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      list="etaList"
                      className="shadow-smsm:text-sm w-full rounded-lg p-4 pe-12 text-sm shadow-sm [&::-webkit-calendar-picker-indicator]:opacity-0"
                      placeholder="Selectionnez un établissement"
                      ref={inputRef}
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

                  <datalist id="etaList">
                    {etablissements?.data.map((etablissement) => (
                      <option
                        key={etablissement.id}
                        value={etablissement.name}
                      />
                    ))}
                  </datalist>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleAddEtablissement}
                    type="button"
                  >
                    <span className="text-sm">Ajouter</span>
                  </button>
                </div>

                {
                  // add button
                }
              </div>
              <dl className="-mb-3 divide-y divide-gray-100 text-sm">
                {etablissementsSelected.map((selected) => (
                  <div
                    key={selected.id}
                    className="grid border-collapse grid-cols-5 gap-1 border border-gray-100 py-3 even:bg-gray-50 sm:grid-cols-4 sm:gap-4"
                  >
                    <dt className="px-1 text-center font-medium text-gray-900 sm:col-span-2">
                      {selected.name}
                    </dt>

                    <dd className="px-1 text-center text-gray-700">
                      {selected.codePostal} {selected.ville}
                    </dd>

                    <dd className="px-1 text-center text-gray-700">
                      <span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEtablissement(selected.id)}
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
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-4 flex flex-row-reverse">
            <button
              type="submit"
              disabled={
                etablissementsSelected.length === 0 ||
                !form.dateDebut ||
                !form.dateFin
              }
              className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              {form.id ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function LotsStep({ setStep }: { setStep: (step: number) => void }) {
  const [prix, setPrix] = useState<number>(0);

  const [surgeryFilter, setSurgeryFilter] = useState<Surgery | undefined>(
    undefined,
  );

  const [referenceName, setReferenceName] = useState<string>();

  const { lot, setLot, addProduitLot, removeProduitLot, createLot, updateLot } =
    usePannierAo();

  const { data: references } = api.reference.findAll.useQuery({
    surgery: surgeryFilter,
    fabricant: lot.fabricant,
  });

  useEffect(() => {
    if (!references?.data) return;

    if (lot.fabricant === Fabricant.SWING) {
      setReferenceName(references?.data[0]?.models[0]?.name);
    } else {
      setReferenceName(references?.data[0]?.reference);
    }
  }, [references, lot.fabricant]);

  const handleAddLot = () => {
    if (!referenceName) return;

    if (lot.fabricant === Fabricant.SWING) {
      const model = references?.data
        .map((reference) => reference.models)
        .flat()
        .find((model) => model.name === referenceName);

      if (!model) return;

      addProduitLot({
        produitId: null,
        produitName: null,
        modeleId: model.id,
        modeleName: model.name,
        prix,
      });
    }

    if (lot.fabricant === Fabricant.AUTRES) {
      const reference = references?.data.find(
        (reference) => reference.reference === referenceName,
      );

      if (!reference) return;

      addProduitLot({
        produitId: reference.id,
        produitName: reference.reference,
        modeleId: null,
        modeleName: null,
        prix: null,
      });
    }
  };

  const handleChangeFabricant = (fab: Fabricant) => {
    // check if lot contains different fabricant

    if (lot.produits.length > 0) {
      if (
        lot.produits.some(
          (produit) =>
            ((produit.modeleId ?? false) && fab === Fabricant.AUTRES) ||
            ((produit.produitId ?? false) && fab === Fabricant.SWING),
        )
      ) {
        return;
      }
    }

    setLot({ ...lot, fabricant: fab });
  };

  const handleDeleteLot = (id: string | undefined | null) => {
    if (!id) return;
    removeProduitLot(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (lot.id) {
        updateLot();
        setStep(2);
        return;
      }
      createLot();
      setStep(2);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="mt-12">
      <form className="mx-auto mt-6 w-3/4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-900"
            >
              Type de marché
            </label>

            <select
              name="source"
              id="source"
              value={lot.type}
              onChange={(e) => {
                setLot({ ...lot, type: e.target.value as TypeMarche });
                setSurgeryFilter(
                  SurgeriesByTypeMarche[e.target.value as TypeMarche][0],
                );
              }}
              className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
            >
              {Object.values(TypeMarche).map((t) => (
                <option key={t} value={t}>
                  {TypeMarcheLabels[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="attribution"
              className="block text-sm font-medium text-gray-900"
            >
              Attribution{" "}
            </label>

            <select
              name="attribution"
              value={lot.attribution}
              className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              onChange={(e) =>
                setLot({ ...lot, attribution: e.target.value as Attribution })
              }
            >
              {Object.values(Attribution).map((attrib) => (
                <option key={attrib} value={attrib}>
                  {AttributionLabels[attrib]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="N° Lot"
              value={lot.numero}
              onChange={(e) => setLot({ ...lot, numero: e.target.value })}
              className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Nom Lot"
              value={lot.name}
              onChange={(e) => setLot({ ...lot, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <ButtonGroup
              activeIndex={lot.fabricant === Fabricant.SWING ? 0 : 1}
              buttons={[
                {
                  label: "Swing",
                  onClick: () => handleChangeFabricant(Fabricant.SWING),
                },

                {
                  label: "Autres",
                  onClick: () => handleChangeFabricant(Fabricant.AUTRES),
                },
              ]}
              onActiveChange={() => {
                /* do nothing */
              }}
            />
          </div>

          <div className="col-span-2 flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
            <div className="mb-4 grid grid-flow-row grid-cols-2 gap-4 px-4 sm:grid-cols-7">
              <h6 className="col-span-2 self-center font-medium">
                Références associés :
              </h6>

              <select
                name="surgery"
                value={surgeryFilter}
                onChange={(e) => setSurgeryFilter(e.target.value as Surgery)}
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
              >
                {(SurgeriesByTypeMarche[lot.type] as string[]).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <div className="col-span-2">
                <select
                  className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                  value={referenceName}
                  onChange={(e) => setReferenceName(e.target.value)}
                >
                  {references?.data.map((reference) =>
                    lot.fabricant === Fabricant.SWING ? (
                      reference.models.map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name}
                        </option>
                      ))
                    ) : (
                      <option key={reference.id} value={reference.reference}>
                        {reference.reference}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                {lot.fabricant === Fabricant.SWING && (
                  <div className="relative">
                    <label htmlFor="prix" className="sr-only">
                      Prix
                    </label>
                    <input
                      id="prix"
                      type="number"
                      inputMode="numeric"
                      placeholder="Prix"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      value={prix}
                      step="0.01" // Autorise l'entrée des centimes
                      onChange={(e) => setPrix(Number(e.target.value))}
                    />
                    <span className="pointer-events-none absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500">
                      €
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={handleAddLot}
                  type="button"
                >
                  <span className="text-sm">Ajouter</span>
                </button>
              </div>
            </div>
            <dl className="-mb-3 divide-y divide-gray-100 text-sm">
              {lot.produits.map((lot, index) => (
                <div
                  key={index}
                  className="grid border-collapse grid-cols-5 gap-1 border border-gray-100 py-3 even:bg-gray-50 sm:grid-cols-4 sm:gap-4"
                >
                  <dt
                    className={`px-1 text-center font-medium text-gray-900 ${lot?.prix !== null && lot?.prix !== undefined ? "col-span-2" : "col-span-3"}`}
                  >
                    {lot.produitName ?? lot.modeleName}
                  </dt>

                  {lot?.prix !== null && lot?.prix !== undefined && (
                    <dd className="px-1 text-center text-gray-700">
                      {lot.prix.toFixed(2)} €
                    </dd>
                  )}

                  <dd className="px-1 text-center text-gray-700">
                    <span>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteLot(lot?.produitId ?? lot?.modeleId)
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
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/** table with references of the lot */}

        <div className="mt-4 flex flex-row-reverse">
          <button
            type="submit"
            disabled={lot.produits.length === 0}
            className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
          >
            {lot.id ? "Modifier Lot" : "Ajouter Lot"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RecapStep({ setStep }: { setStep: (step: number) => void }) {
  const { lotRecap, form, editLot, removeLot } = usePannierAo();

  const router = useRouter();

  const [deleteLot, setDeleteLot] = useState<Lot | undefined>();

  const validateMutation = api.source.validateAo.useMutation({
    onSuccess: () => {
      router.push("/dashboard/ao");
    },
  });

  const deleteLotMutation = api.source.deleteLot.useMutation({
    onSuccess: () => {
      if (deleteLot) {
        removeLot(deleteLot.id!);
      }
      setDeleteLot(undefined);
    },
  });

  const handleDeleteLot = () => {
    if (deleteLot) {
      deleteLotMutation.mutate({ id: deleteLot.id! });
    }
  };

  const handleValidate = () => {
    validateMutation.mutate({ id: form.id!, status: true });
  };

  return (
    <div className="mt-12">
      <div className="mx-auto w-3/4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Type d&apos;AO :
            </p>
            <p className="mt-2 text-sm text-gray-700">{form.source}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Nom de l&apos;AO :
            </p>
            <p className="mt-2 text-sm text-gray-700">{form.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Date de début :</p>
            <p className="mt-2 text-sm text-gray-700">
              {form.dateDebut
                ? format(new Date(form.dateDebut), "dd/MM/yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Date de fin :</p>
            <p className="mt-2 text-sm text-gray-700">
              {form.dateFin
                ? format(new Date(form.dateFin), "dd/MM/yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Numéro de marché :
            </p>
            <p className="mt-2 text-sm text-gray-700">{form.numero}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Numéro de consultation :
            </p>
            <p className="mt-2 text-sm text-gray-700">{form.consultation}</p>
          </div>
          {form.objet && form.objet.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-900">Objet :</p>
              <p className="mt-2 text-sm text-gray-700">{form.objet}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-row">
          <span
            className="mt-4 inline-block cursor-pointer text-blue-600"
            onClick={() => setStep(1)}
          >
            Ajouter un Lot
          </span>
        </div>

        {lotRecap.map((lot) => (
          <div key={lot.id} className="mt-6 overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className="text-left">
                <tr>
                  <th className="w-1/6 whitespace-nowrap bg-gray-50 px-4 py-3 font-medium text-gray-900">
                    {TypeMarcheLabels[lot.type]}
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

                  <th className="w-1/12 whitespace-nowrap bg-gray-50 px-4  py-3 font-medium text-gray-900">
                    <button
                      className="mr-2 inline-block rounded-lg bg-red-50 px-4 py-2 text-red-500 hover:bg-red-100"
                      onClick={() => setDeleteLot(lot)}
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => {
                        editLot(lot.id!);
                        setStep(1);
                      }}
                      className="inline-block rounded-lg bg-blue-50 px-4 py-2 text-blue-500 hover:bg-blue-100"
                    >
                      Modifier
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {lot.produits.map((produit) => (
                  <tr key={produit?.modeleId ?? produit.produitId}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900"></td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {lot.numero}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {lot.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {produit.modeleName ?? produit.produitName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {produit.prix ? produit.prix?.toFixed(2) + " €" : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <div className="mt-4 flex flex-row-reverse">
          <button
            onClick={handleValidate}
            className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            Valider AO
          </button>
        </div>
      </div>
      {deleteLot && (
        <>
          <div
            role="alert"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="rounded-xl border border-gray-100 bg-white p-8">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <strong className="block font-medium text-gray-900">
                    Supprimer le lot
                  </strong>

                  <p className="mt-2 text-sm text-gray-700">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <strong>
                      {deleteLot.name} - {deleteLot.numero}{" "}
                    </strong>
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                      onClick={() => setDeleteLot(undefined)}
                    >
                      <span className="text-sm">Annuler</span>
                    </button>

                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                      onClick={handleDeleteLot}
                    >
                      <span className="text-sm">Valider</span>
                    </button>
                  </div>
                </div>

                <button
                  className="text-gray-500 transition hover:text-gray-600"
                  onClick={() => setDeleteLot(undefined)}
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
  );
}
