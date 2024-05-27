"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import { format } from "date-fns";

import { Time } from "@internationalized/date";

import {
  CiviliteLabels,
  GroupRDVTypes,
  RDVByServiceWithEssai,
  RendezVousTypeLabels,
  ServiceLabels,
  SurgeriesByService,
} from "@/utils/constantes";
import { useMemo, useState } from "react";
import { References } from "@/app/(primary)/dashboard/contact/fiche/[id]/page";
import DatePickerComponent from "@/app/_components/core/DatePicker";
import TimePickerComponent from "@/app/_components/core/TimePicker";
import {
  type Model,
  RendezVousType,
  type Service,
  Surgery,
} from "@prisma/client";
import { useRouter } from "next/navigation";

export default function FicheActivite({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { data: activite, isPending } =
    api.activite.findOneByChirurgien.useQuery(
      {
        id: params.id,
      },
      {
        enabled: !!params,
      },
    );

  const [form, setForm] = useState<{
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  }>({
    date: "",
    timeDebut: new Time(0, 0),
    timeFin: new Time(0, 0),
    observation: "",
    rdvType: RendezVousType.RDV1 as RendezVousType,
    modelEssaiRef: [],
    isCheck: false,
  });

  const [error, setError] = useState<string | null>(null);

  const confirmMutation = api.activite.confirm.useMutation({
    onSettled: () => {
      router.push("/dashboard/commercial/activite");
    },
  });

  const createActivity = api.activite.create.useMutation({
    onSettled: () => {
      confirmMutation.mutate({
        id: params.id,
        done: true,
      });
    },
  });

  const handleSubmit = () => {
    setError(null);

    if (form.isCheck) {
      if (!form.date || !form.timeDebut || !form.timeFin) {
        setError("Veuillez remplir tous les champs");
        return;
      }

      if (form.timeDebut >= form.timeFin) {
        setError("L'heure de fin doit être supérieure à l'heure de début");
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
        chirurgienIds: [activite?.chirurgien.id ?? ""],
        rdvType: form.rdvType,
        modelEssai: form.modelEssaiRef.map((ref) => ({
          modelId: ref.model.id,
          surgery: ref.surgery as Surgery,
        })),
      });
    } else {
      confirmMutation.mutate({
        id: params.id,
        observation: form.observation,
        done: true,
      });
    }
  };

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

              {/* Header avec les infos de l'activité */}
              <h1 className="mb-12 text-center text-xl font-medium uppercase text-black sm:text-2xl">
                Compte rendu du rendez-vous
              </h1>

              {activite && (
                <>
                  <div className="mt-16 rounded-lg border border-gray-100 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:gap-4">
                      <div>
                        <p className="text-lg font-bold text-blue-900">
                          Date du rendez-vous :{" "}
                        </p>
                        <p className=" text-gray-800">
                          {format(
                            new Date(activite.rendezVous.date),
                            "dd/MM/yyyy",
                          )}{" "}
                          à{" "}
                          {format(new Date(activite.rendezVous.date), "HH:mm")}
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-900">
                          Etablissement:
                        </p>
                        <p className="text-gray-800">
                          {activite.chirurgien.etablissement.name}{" "}
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-900">
                          Contact:
                        </p>
                        <p className=" flex flex-col text-gray-800">
                          <span>
                            {activite.chirurgien.civilite &&
                              CiviliteLabels[activite.chirurgien.civilite]}{" "}
                            {activite.chirurgien.lastname}{" "}
                            {activite.chirurgien.firstname}
                          </span>
                          <span className="text-sm text-gray-500">
                            {" "}
                            {activite.chirurgien.fonction}{" "}
                            {ServiceLabels[activite.chirurgien.service]}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-bold text-blue-900">
                          Type d&apos;activité :{" "}
                        </p>
                        <p className=" text-gray-800">
                          {RendezVousTypeLabels[activite.rendezVous.type]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {GroupRDVTypes.PHARM.includes(
                    activite.rendezVous.type as
                      | "RDV1"
                      | "RDV2"
                      | "RDV_VALIDATION"
                      | "RDV_FORMATION"
                      | "RDV1_SBO"
                      | "RDV2_IMPLANTATION",
                  ) && (
                    <PharmaRDV
                      service={activite.chirurgien.service}
                      contactId={activite.chirurgien.id}
                      form={form}
                      setForm={setForm}
                    />
                  )}

                  {GroupRDVTypes.RDV.includes(
                    activite.rendezVous.type as
                      | "RDV1_CONSULT_CHIR"
                      | "RDV2_CONSULT_CHIR"
                      | "RDV1_BLOC_CHIR"
                      | "RDV2_BLOC_CHIR"
                      | "RDV_STAFF_CHIR",
                  ) && (
                    <ChirRDV
                      contactId={activite.chirurgien.id}
                      form={form}
                      setForm={setForm}
                    />
                  )}

                  {/* {GroupRDVTypes.ESSAI.includes(
                    activite.rendezVous.type as "ESSAI1" | "ESSAI2",
                  ) && <EssaiRDV params={params} />} */}
                </>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-600">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                >
                  Finaliser
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PharmaRDV({
  service,
  form,
  setForm,
}: {
  service: Service;
  contactId?: string;
  form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  };
  setForm: (form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  }) => void;
}) {
  return (
    <>
      <div className="mt-6">
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Observations
          </label>
          <textarea
            className="mt-2 h-24 w-full rounded-lg border border-gray-200 p-2"
            value={form.observation}
            onChange={(e) =>
              setForm({
                ...form,
                observation: e.target.value,
              })
            }
          ></textarea>
        </div>

        <div className="mt-6 flex flex-row items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">
            Prochain rendez-vous ?
          </label>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              id="switch"
              type="checkbox"
              className="peer sr-only"
              checked={form.isCheck}
              onChange={() => setForm({ ...form, isCheck: !form.isCheck })}
            />
            <label htmlFor="switch" className="hidden"></label>
            <div className="peer h-6 w-11 rounded-full border bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300"></div>
          </label>
        </div>
      </div>

      {form.isCheck && (
        <form className="mx-auto mt-6 w-3/4">
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
                {RDVByServiceWithEssai[service].map((rdvType) => (
                  <option key={rdvType} value={rdvType}>
                    {RendezVousTypeLabels[rdvType]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      )}
    </>
  );
}

function ChirRDV({
  contactId,
  form,
  setForm,
}: {
  contactId: string;
  form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  };
  setForm: (form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  }) => void;
}) {
  const {
    data: contact,
    refetch,
    isPending,
  } = api.chirurgien.findOne.useQuery(
    {
      id: contactId,
    },
    {
      enabled: !!contactId,
    },
  );

  return (
    <>
      {isPending
        ? ""
        : contact && (
            <>
              <div className="mt-6">
                <References contact={contact} refetch={refetch} />
              </div>
              <PharmaRDV
                service={contact.service}
                form={form}
                setForm={setForm}
              />
              {form.rdvType === RendezVousType.ESSAI1 ||
              form.rdvType === RendezVousType.ESSAI2 ? (
                <EssaiRDV
                  service={contact.service}
                  form={form}
                  setForm={setForm}
                />
              ) : (
                ""
              )}
            </>
          )}
    </>
  );
}

function EssaiRDV({
  service,
  form,
  setForm,
}: {
  service: Service;
  form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  };
  setForm: (form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    observation: string;
    modelEssaiRef: { surgery: string; model: Model }[];
    isCheck: boolean;
  }) => void;
}) {
  const [addModelMode, setAddModelMode] = useState(false);

  const modelBySurgery = useMemo(() => {
    const modelBySurgery: Record<string, Model[]> = {};

    form.modelEssaiRef.forEach((ref) => {
      if (modelBySurgery[ref.surgery]) {
        modelBySurgery[ref.surgery]?.push(ref.model);
      } else {
        modelBySurgery[ref.surgery] = [ref.model];
      }
    });

    return modelBySurgery;
  }, [form.modelEssaiRef]);

  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between">
        <div
          role="button"
          onClick={() => setAddModelMode(true)}
          className="mb-4 inline-block cursor-pointer text-blue-600"
        >
          Ajouter un model à cet essai
        </div>
      </div>

      <div>
        <div className="my-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="text-left">
              <tr>
                {Object.values(SurgeriesByService[service]).map((s) => {
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
                {Object.values(SurgeriesByService[service]).map((refs, i) => (
                  <td key={i} className="w-1/12 px-6 py-4">
                    <ul>
                      {modelBySurgery[refs]?.map((ref) => (
                        <li
                          key={`${ref.id}`}
                          className="group flex items-center justify-between rounded-lg p-2 transition-colors duration-300 ease-in-out hover:bg-gray-100"
                        >
                          <span className="text-medium">{ref.name}</span>
                          <button
                            className="text-red-500 opacity-0 transition-opacity duration-300 ease-in-out hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => {
                              const newModelEssaiRef =
                                form.modelEssaiRef.filter(
                                  (r) =>
                                    r.surgery !== refs && r.model.id !== ref.id,
                                );

                              setForm({
                                ...form,
                                modelEssaiRef: newModelEssaiRef,
                              });
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {addModelMode && (
        <>
          <NewEssaiForm
            setAddRefMode={setAddModelMode}
            service={service}
            onSubmit={(type, model) => {
              const newModelEssaiRef = form.modelEssaiRef.concat({
                surgery: type,
                model,
              });

              setForm({
                ...form,
                modelEssaiRef: newModelEssaiRef,
              });
            }}
          />
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
        </>
      )}
    </>
  );
}

function NewEssaiForm({
  service,
  setAddRefMode,
  onSubmit,
}: {
  service: Service;
  setAddRefMode: (addRefMode: boolean) => void;
  onSubmit: (type: Surgery, model: Model) => void;
}) {
  const [produit, setProduit] = useState<string | undefined>(undefined);

  const [type, setType] = useState<Surgery>(
    () => SurgeriesByService[service]?.[0] ?? Surgery.HIL,
  );

  const models = api.reference.findAllModels.useQuery({
    surgery: type,
  });

  const handleSubmit = () => {
    if (produit) {
      const model = models?.data?.find((m) => m.id === produit);

      if (!model) return;

      onSubmit(type, model);
      setAddRefMode(false);
    }
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
              Ajouter un model à essayer
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
        <div className="space-y-4">
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
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1">
            <select
              name="product"
              id="product"
              value={produit}
              onChange={(e) => setProduit(e.target.value)}
              className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
            >
              <option value="">Selectionner un model</option>
              {models?.data?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!produit}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
