"use client";

import { useEffect, useMemo, useState } from "react";

import DatePickerComponent from "@/app/_components/core/DatePicker";
import Image from "next/image";

import { Time } from "@internationalized/date";
import TimePickerComponent from "@/app/_components/core/TimePicker";
import { api } from "@/trpc/react";
import { type Civilite, Service } from "@prisma/client";
import type { Fonction, RendezVousType } from "@prisma/client";
import {
  CiviliteLabels,
  RDVByService,
  RendezVousTypeLabels,
  ServiceLabels,
} from "@/utils/constantes";
import { formatNumeroTelephone } from "@/utils";
import { usePopup } from "@/app/_hooks/usePopUp";
import { useRouter } from "next/navigation";

export default function CreateActivity() {
  const router = useRouter();

  const [form, setForm] = useState<{
    date: string;
    timeDebut: Time;
    timeFin: Time;
    etablissement: string | undefined;
    service: Service | undefined;
    rdvType: RendezVousType | undefined;
    selectedChirurgienId: string | undefined;
    selectedChirurgien: {
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
    }[];
  }>({
    date: "",
    timeDebut: new Time(0, 0),
    timeFin: new Time(0, 0),
    etablissement: undefined,
    service: Service.CHIR_DIGESTIF,
    rdvType: RDVByService[Service.CHIR_DIGESTIF][0],
    selectedChirurgienId: undefined,
    selectedChirurgien: [],
  });

  const { data: etablissements } = api.etablissement.findAll.useQuery({});

  useEffect(() => {
    if (!form.etablissement && etablissements?.data[0]) {
      setForm({
        ...form,
        etablissement: etablissements.data[0].id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etablissements]);

  const { data: chirurgiens } = api.chirurgien.findAll.useQuery({
    etablissementId: form.etablissement,
    service: form.service,
  });

  useEffect(() => {
    if (chirurgiens?.length) {
      setForm((prevForm) => ({
        ...prevForm,
        selectedChirurgienId: chirurgiens[0]?.id,
      }));
    }
  }, [chirurgiens]);

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      selectedChirurgien: [],
    }));
  }, [form.etablissement, setForm]);

  useEffect(() => {
    setError(null);
  }, [form]);

  const selectedChir = useMemo(() => {
    return chirurgiens?.find((chir) => chir.id === form.selectedChirurgienId);
  }, [form.selectedChirurgienId, chirurgiens]);

  const { openPopup, setTitle, setMessage } = usePopup();

  const [error, setError] = useState<string | null>(null);

  const createActivity = api.activite.create.useMutation({
    onSuccess: () => {
      openPopup();
      setTitle("Succès");
      setMessage("Le rendez-vous a été créé avec succès");
      router.push("/dashboard/commercial/activite");
    },
    onError: (error) => {
      openPopup();
      setTitle("Erreur");
      setMessage(error.message);
    },
  });

  const handleAddContact = () => {
    if (selectedChir) {
      setForm((prev) => {
        const isAlreadyInList = prev.selectedChirurgien.some(
          (chir) => chir.id === selectedChir.id,
        );

        if (isAlreadyInList) {
          return prev;
        }

        return {
          ...form,
          selectedChirurgien: [
            ...form.selectedChirurgien,
            {
              id: selectedChir.id,
              civilite: selectedChir.civilite,
              fonction: selectedChir.fonction,
              firstname: selectedChir.firstname,
              lastname: selectedChir.lastname,
              email: selectedChir.email,
              phone: selectedChir.phone,
              phone2: selectedChir.phone2,
              adresse: selectedChir.adresse,
              isDiffusion: selectedChir.isDiffusion,
            },
          ],
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    if (!form.date || !form.timeDebut || !form.timeFin) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (form.timeDebut >= form.timeFin) {
      setError("L'heure de fin doit être supérieure à l'heure de début");
      return;
    }

    if (!form.etablissement || !form.service || !form.rdvType) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!form.selectedChirurgien.length) {
      setError("Veuillez sélectionner un chirurgien");
      return;
    }

    const date = new Date(form.date);
    date.setHours(form.timeDebut.hour);
    date.setMinutes(form.timeDebut.minute);

    const dateFin = new Date(form.date);
    dateFin.setHours(form.timeFin.hour);
    dateFin.setMinutes(form.timeFin.minute);

    createActivity.mutate({
      date,
      dateFin,
      chirurgienIds: form.selectedChirurgien.map((chir) => chir.id),
      rdvType: form.rdvType,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <div className="relative mt-6 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
            <Image
              src="/img/logo.gif"
              alt="Swing"
              width={160}
              height={160}
              className="absolute left-6 top-6"
            />

            <h1 className="mb-12 text-center text-xl font-medium uppercase text-black sm:text-2xl">
              Nouveau rendez-vous
            </h1>

            <form className="mx-auto mt-6 w-3/4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-8 sm:grid-cols-3">
                <DatePickerComponent
                  label="Date"
                  selectedDate={form.date}
                  onDateChange={(date) => {
                    setForm({ ...form, date: date! });
                  }}
                  noPastDate
                />
                <TimePickerComponent
                  label="Heure de début"
                  time={form.timeDebut}
                  onChange={(time) => {
                    setForm({ ...form, timeDebut: time });
                  }}
                />

                <TimePickerComponent
                  label="Heure de fin"
                  time={form.timeFin}
                  onChange={(time) => {
                    setForm({ ...form, timeFin: time });
                  }}
                />

                <div>
                  <label
                    htmlFor="etablissement"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Etablissement
                  </label>

                  <select
                    id="etablissement"
                    name="etablissement"
                    value={form.etablissement}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        etablissement: e.target.value,
                        selectedChirurgienId: undefined,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                  >
                    {etablissements?.data?.map((etablissement) => (
                      <option key={etablissement.id} value={etablissement.id}>
                        {etablissement.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Service
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        service: e.target.value as Service,
                        selectedChirurgienId: undefined,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                  >
                    {Object.values(Service).map((service) => (
                      <option key={service} value={service}>
                        {ServiceLabels[service]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="etablissement"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Type de rendez-vous
                  </label>

                  <select
                    value={form.rdvType}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        rdvType: e.target.value as RendezVousType,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                  >
                    {RDVByService[form.service!].map((rdvType) => (
                      <option key={rdvType} value={rdvType}>
                        {RendezVousTypeLabels[rdvType]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="chirurgien"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact
                  </label>
                  <select
                    id="chirurgien"
                    name="chirurgien"
                    value={form.selectedChirurgienId}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        selectedChirurgienId: e.target.value,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border-gray-300 p-4 pe-12 text-sm text-gray-700 shadow-sm sm:text-sm"
                  >
                    {chirurgiens?.map((chirurgien) => (
                      <option key={chirurgien.id} value={chirurgien.id}>
                        {chirurgien.lastname} {chirurgien.firstname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleAddContact}
                  >
                    <span className="text-sm">Ajouter</span>
                  </button>
                </div>
              </div>

              {selectedChir && (
                <article className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-4">
                    <Image
                      alt=""
                      src="/img/default.png"
                      width={32}
                      height={32}
                      className="size-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-medium">
                        {CiviliteLabels[selectedChir?.civilite]}{" "}
                        {selectedChir?.firstname}{" "}
                        {selectedChir?.lastname?.toLocaleUpperCase()}
                      </h3>

                      <div className="flow-root">
                        <ul className="-m-1 flex flex-wrap">
                          <li className="p-1 leading-none">
                            <span className="text-xs font-medium text-gray-600">
                              {selectedChir?.fonction}
                            </span>
                          </li>
                          <li className="p-1 leading-none">
                            <span className="text-xs font-medium text-gray-600">
                              {selectedChir?.service &&
                                ServiceLabels[selectedChir?.service]}
                            </span>
                          </li>
                          <li className="p-1 leading-none">
                            <span className="text-xs font-medium text-gray-600">
                              {selectedChir?.email}
                            </span>
                          </li>

                          <li className="p-1 leading-none">
                            <span className="text-xs font-medium text-gray-600">
                              {formatNumeroTelephone(selectedChir?.phone ?? "")}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              <dl className="mt-4 divide-y divide-gray-100 text-sm">
                {form.selectedChirurgien.map((chir) => (
                  <div
                    key={chir.id}
                    className="grid border-collapse grid-cols-5 gap-1 border border-gray-100 py-3 shadow-sm even:bg-gray-50 sm:grid-cols-4 sm:gap-4"
                  >
                    <dt className="px-1 text-center font-medium text-gray-900 sm:col-span-2">
                      {chir.firstname} {chir.lastname}
                    </dt>

                    <dd className="px-1 text-center text-gray-700">
                      {selectedChir?.fonction}
                    </dd>

                    <dd className="px-1 text-center text-gray-700">
                      {/* delete button */}
                      <button
                        className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                        title="Delete Commercial"
                        onClick={() =>
                          setForm({
                            ...form,
                            selectedChirurgien: form.selectedChirurgien.filter(
                              (ch) => ch.id !== chir.id,
                            ),
                          })
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

              {error && (
                <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-row-reverse">
                <button
                  type="submit"
                  className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
