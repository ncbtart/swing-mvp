"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import { format } from "date-fns";

import { Time } from "@internationalized/date";

import {
  CiviliteLabels,
  GroupRDVTypes,
  PoseLabels,
  RDVByServiceWithEssai,
  RendezVousTypeLabels,
  ServiceLabels,
  SurgeriesByService,
} from "@/utils/constantes";
import { useEffect, useMemo, useState } from "react";
import { References } from "@/app/(primary)/dashboard/contact/fiche/[id]/page";
import DatePickerComponent from "@/app/_components/core/DatePicker";
import TimePickerComponent from "@/app/_components/core/TimePicker";
import {
  type Model,
  RendezVousType,
  type Service,
  Surgery,
  Pose,
} from "@prisma/client";
import { useRouter } from "next/navigation";

interface UploadResponse {
  status: string;
  message: string;
  files: string[];
}

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
    rendezVous: {
      date: string;
      timeDebut: Time;
      timeFin: Time;
      rdvType: RendezVousType;
      modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
    }[];
    observation: string;
    isCheck: boolean;
    state: {
      date: string;
      timeDebut: Time;
      timeFin: Time;
      rdvType: RendezVousType;
      modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
    };
  }>({
    rendezVous: [],
    observation: "",
    isCheck: false,
    state: {
      date: "",
      timeDebut: new Time(0, 0),
      timeFin: new Time(0, 0),
      rdvType: RendezVousType.RDV1 as RendezVousType,
      modelEssaiRef: [],
    },
  });

  const [error, setError] = useState<string | null>(null);

  const [modelEssaiCr, setModelEssaiCr] = useState<
    ({
      model: {
        id: string;
        name: string;
        productId: string;
        picto: string | null;
      };
    } & {
      id: string;
      modelId: string;
      rendezVousId: string;
      surgery: Surgery;
      done: boolean;
      validation: boolean;
      observation: string | null;
      pose: Pose | null;
      reprogrammation: boolean;
      date: boolean;
      file: File | null;
    })[]
  >([]);

  useEffect(() => {
    if (
      activite &&
      activite.rendezVous.ModelEssaiRendezVous &&
      activite.rendezVous.type === RendezVousType.ESSAI &&
      !modelEssaiCr.length
    ) {
      setModelEssaiCr(
        activite.rendezVous.ModelEssaiRendezVous.map((m) => ({
          ...m,

          reprogrammation: false,
          date: false,
          file: null,
        })),
      );
    }
  }, [activite, modelEssaiCr]);

  const confirmMutation = api.activite.confirm.useMutation({
    onSuccess: () => {
      router.push("/dashboard/commercial/activite");
    },
  });

  useEffect(() => {
    setError(null);
  }, [form]);

  const createActivity = api.activite.create.useMutation({});

  const handleRepro = async (id: string, reprogrammation: boolean) => {
    setModelEssaiCr(
      modelEssaiCr.map((m) => {
        if (reprogrammation === false) {
          return m.model.id === id ? { ...m, reprogrammation, date: false } : m;
        }
        return m.model.id === id ? { ...m, reprogrammation } : m;
      }),
    );

    if (reprogrammation === false) {
      setForm((prev) => ({
        ...prev,
        isCheck: prev.state.modelEssaiRef.length - 1 === 0 ? false : true,
        state: {
          ...prev.state,
          modelEssaiRef: prev.state.modelEssaiRef.filter(
            (ref) => ref.model.id !== id,
          ),
        },
      }));

      return;
    }
  };

  const handleReproWithDate = async (id: string, date: boolean) => {
    setModelEssaiCr(
      modelEssaiCr.map((m) => (m.model.id === id ? { ...m, date } : m)),
    );

    if (!date) {
      setForm((prev) => ({
        ...prev,
        isCheck: prev.state.modelEssaiRef.length - 1 === 0 ? false : true,
        state: {
          ...prev.state,
          modelEssaiRef: prev.state.modelEssaiRef.filter(
            (ref) => ref.model.id !== id,
          ),
        },
      }));

      return;
    }

    const modelReprogramed = modelEssaiCr.find((m) => m.model.id === id);

    if (modelReprogramed?.reprogrammation) {
      // add this modelEssai in new Rendez Vous
      setForm((prev) => ({
        ...prev,
        isCheck: true,
        state: {
          ...prev.state,
          rdvType: RendezVousType.ESSAI,
          modelEssaiRef: prev.state.modelEssaiRef.find(
            (ref) => ref.model.id === id,
          )
            ? prev.state.modelEssaiRef
            : [
                ...prev.state.modelEssaiRef,
                {
                  surgery: modelReprogramed.surgery,
                  model: modelReprogramed.model,
                  pose: modelReprogramed.pose,
                },
              ],
        },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (form.isCheck) {
        if (form.rendezVous.length === 0) {
          setError("Veuillez ajouter au moins un rendez-vous");
          return;
        }

        const rdvCreated: {
          date: string;
          timeDebut: Time;
          timeFin: Time;
          rdvType: RendezVousType;
          modelEssaiRef: {
            surgery: Surgery;
            model: { id: string; name: string; productId: string };
          }[];
        }[] = [];

        // Create an array of promises for each activity creation
        const promises = form.rendezVous.map((rdv) => {
          // Set the start date and time
          const date = new Date(rdv.date);
          date.setHours(rdv.timeDebut.hour);
          date.setMinutes(rdv.timeDebut.minute);

          // Set the end date and time
          const dateFin = new Date(rdv.date);
          dateFin.setHours(rdv.timeFin.hour);
          dateFin.setMinutes(rdv.timeFin.minute);

          // Return the mutation promise
          return createActivity
            .mutateAsync({
              date,
              dateFin,
              rdvType: rdv.rdvType,
              chirurgienIds: [activite?.chirurgienId ?? ""],
              lastRdvId: activite?.rendezVousId,
              modelEssai: rdv.modelEssaiRef.map((ref) => ({
                surgery: ref.surgery,
                modelId: ref.model.id,
                pose: ref.pose,
              })),
            })
            .then(() => {
              // remove the created activity from the form
              rdvCreated.push(rdv);
            });
        });

        // Await all activity creation promises
        await Promise.all(promises).finally(() => {
          // Update the form with the remaining activities
          setForm({
            ...form,
            rendezVous: form.rendezVous.filter((r) => !rdvCreated.includes(r)),
          });
        });
      }

      if (activite?.rendezVous.type === RendezVousType.ESSAI) {
        const modelEssai = await Promise.all(
          modelEssaiCr.map(async (ref) => {
            let filePath;
            if (ref.file) {
              const uploadedFiles = await uploadFiles([ref.file]);
              filePath = uploadedFiles[0] ?? null;
            }
            return {
              id: ref.id,
              done: ref.done,
              validation: ref.validation,
              observation: ref.observation ?? undefined,
              schedule: ref.reprogrammation && !ref.date ? true : false,
              filePath,
            };
          }),
        );

        confirmMutation.mutate({
          id: params.id,
          observation: form.observation,
          done: true,
          modelEssai,
        });
      } else {
        confirmMutation.mutate({
          id: params.id,
          observation: form.observation,
          done: true,
          modelEssai: [],
        });
      }
    } catch (error) {
      setError("Une erreur est survenue");
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/uploadFiles", {
      method: "POST",
      body: formData,
    });

    const data = (await res.json()) as UploadResponse;
    return data.files;
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
            <div className="relative mt-2 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
              <Image
                src="/img/logo.gif"
                alt="Swing"
                width={160}
                height={160}
                className="absolute left-6 top-6"
              />

              {/* Header avec les infos de l'activité */}
              <h1 className="mb-12 text-center text-xl font-medium text-black sm:text-2xl">
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

                  {/* Chirurgie */}

                  {activite.rendezVous.type === RendezVousType.ESSAI ? (
                    <div className="mt-6">
                      {modelEssaiCr.map((model) => (
                        <article
                          key={model.id}
                          className="mb-6 gap-4 rounded-xl bg-white p-2 ring ring-indigo-50 sm:p-4 lg:p-6"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-6 sm:gap-4">
                            <div className="flex flex-col items-center justify-center">
                              <h3 className="w-full text-center font-bold">
                                {model.model.name}
                              </h3>
                              <span className="text-xs uppercase text-gray-500">
                                {" "}
                                {model.pose && PoseLabels[model.pose]}
                              </span>
                              {model.model.picto && (
                                <Image
                                  src={`/picto/${model.model.picto}.png`}
                                  alt="logo"
                                  className="mt-4"
                                  width={80}
                                  height={80}
                                />
                              )}
                            </div>

                            <div className="col-span-2 grid grid-cols-2 gap-6">
                              <div className="flex items-center justify-between text-center">
                                <label className="mr-2 block text-sm font-bold text-gray-700">
                                  Posé
                                </label>
                                <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                                  <button
                                    className={`inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative ${!model.done ? "bg-red-50 text-red-600" : ""}`}
                                    onClick={() =>
                                      setModelEssaiCr(
                                        modelEssaiCr.map((m) =>
                                          m.id === model.id
                                            ? { ...m, done: false }
                                            : m,
                                        ),
                                      )
                                    }
                                  >
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
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    className={`inline-block p-3 text-gray-700 hover:bg-gray-50 focus:relative ${model.done ? "bg-green-100 text-green-600" : ""}`}
                                    onClick={() =>
                                      setModelEssaiCr(
                                        modelEssaiCr.map((m) =>
                                          m.id === model.id
                                            ? { ...m, done: true }
                                            : m,
                                        ),
                                      )
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="size-6 font-bold"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                  </button>
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-center">
                                {model.done ? (
                                  <>
                                    <label className="block text-sm font-bold text-gray-700">
                                      Validé
                                    </label>
                                    <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                                      <button
                                        className={`inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative ${!model.validation ? "bg-red-50 text-red-600" : ""}`}
                                        onClick={() =>
                                          setModelEssaiCr(
                                            modelEssaiCr.map((m) =>
                                              m.id === model.id
                                                ? { ...m, validation: false }
                                                : m,
                                            ),
                                          )
                                        }
                                      >
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
                                            d="M6 18 18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>

                                      <button
                                        className={`inline-block p-3 text-gray-700 hover:bg-gray-50 focus:relative ${model.validation ? "bg-green-100 text-green-600" : ""}`}
                                        onClick={() =>
                                          setModelEssaiCr(
                                            modelEssaiCr.map((m) =>
                                              m.id === model.id
                                                ? { ...m, validation: true }
                                                : m,
                                            ),
                                          )
                                        }
                                      >
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
                                            d="m4.5 12.75 6 6 9-13.5"
                                          />
                                        </svg>
                                      </button>
                                    </span>
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>

                              <div className="flex items-center justify-between text-center">
                                <label className="block text-sm font-bold text-gray-700">
                                  Reprogr.
                                </label>
                                <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                                  <button
                                    className={`inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative ${!model.reprogrammation ? "bg-red-50 text-red-600" : ""}`}
                                    onClick={() =>
                                      handleRepro(model.model.id, false)
                                    }
                                  >
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
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    className={`inline-block p-3 text-gray-700 hover:bg-gray-50 focus:relative ${model.reprogrammation ? "bg-green-100 text-green-600" : ""}`}
                                    onClick={() =>
                                      handleRepro(model.model.id, true)
                                    }
                                  >
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
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                  </button>
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-center">
                                <label className="mr-2 block text-sm font-bold text-gray-700">
                                  Date
                                </label>
                                <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                                  <button
                                    className={`inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative ${!model.date ? "bg-red-50 text-red-600" : ""}`}
                                    onClick={() =>
                                      handleReproWithDate(model.model.id, false)
                                    }
                                  >
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
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    className={`inline-block p-3 text-gray-700 hover:bg-gray-50 focus:relative ${model.date ? "bg-green-100 text-green-600" : ""}`}
                                    onClick={() =>
                                      handleReproWithDate(model.model.id, true)
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="size-6 font-bold"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                  </button>
                                </span>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-gray-700">
                                Observations
                              </label>
                              <textarea
                                className="mt-2 h-24 w-full resize-none rounded-lg border border-gray-200 p-2"
                                value={model.observation ?? ""}
                                onChange={(e) => {
                                  setModelEssaiCr(
                                    modelEssaiCr.map((m) =>
                                      m.id === model.id
                                        ? { ...m, observation: e.target.value }
                                        : m,
                                    ),
                                  );
                                }}
                              ></textarea>

                              <div className="relative mt-2 flex flex-row-reverse">
                                <div>
                                  <label
                                    htmlFor="file-upload"
                                    className="block text-sm font-medium text-gray-700"
                                  ></label>
                                  {model.done && (
                                    <div className="mt-1 flex items-center">
                                      {model.file && (
                                        <span className="mr-2 inline-flex overflow-hidden">
                                          {model.file?.name}
                                          <span>
                                            <button
                                              onClick={() =>
                                                setModelEssaiCr(
                                                  modelEssaiCr.map((m) =>
                                                    m.id === model.id
                                                      ? {
                                                          ...m,
                                                          file: null,
                                                        }
                                                      : m,
                                                  ),
                                                )
                                              }
                                              className="ml-2 text-red-500"
                                            >
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
                                                  d="M6 18 18 6M6 6l12 12"
                                                />
                                              </svg>
                                            </button>
                                          </span>
                                        </span>
                                      )}

                                      <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={(e) => {
                                          setModelEssaiCr(
                                            modelEssaiCr.map((m) =>
                                              m.id === model.id
                                                ? {
                                                    ...m,
                                                    file:
                                                      e.target.files?.[0] ??
                                                      null,
                                                  }
                                                : m,
                                            ),
                                          );
                                        }}
                                      />
                                      <label
                                        htmlFor="file-upload"
                                        className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                      >
                                        <Image
                                          alt="logo"
                                          src="/img/pdf.svg"
                                          width={25}
                                          height={25}
                                          className="mr-2"
                                        />
                                        Ajouter fiche d&apos;essai
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <>
                      {GroupRDVTypes.RDV.includes(
                        activite.rendezVous.type as
                          | "RDV1_CONSULT_CHIR"
                          | "RDV2_CONSULT_CHIR"
                          | "RDV1_BLOC_CHIR"
                          | "RDV2_BLOC_CHIR"
                          | "RDV_STAFF_CHIR",
                      ) && <ChirRDV contactId={activite.chirurgienId} />}

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
                    </>
                  )}

                  <div className="mt-12 flex flex-row items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Prochain rendez-vous ?
                    </label>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        id="switch"
                        type="checkbox"
                        className="peer sr-only"
                        checked={form.isCheck}
                        onChange={() => {
                          if (form.rendezVous.length > 0) {
                            return;
                          }

                          setForm({
                            ...form,
                            isCheck: !form.isCheck,
                          });
                        }}
                      />
                      <label htmlFor="switch" className="hidden"></label>
                      <div className="peer h-6 w-11 rounded-full border bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300"></div>
                    </label>
                  </div>

                  {form.isCheck && (
                    <div className="mx-auto mt-6 w-3/4">
                      <RendezVousForm
                        service={activite.chirurgien.service}
                        rendezVous={form.rendezVous}
                        state={form.state}
                        setState={(newState) =>
                          setForm((prev) => ({ ...prev, state: newState }))
                        }
                        setRendezVous={(newRendezVous) => {
                          setForm((prev) => ({
                            ...prev,
                            rendezVous: newRendezVous,
                          }));
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Essai */}

              {/* {GroupRDVTypes.ESSAI.includes(
                    activite.rendezVous.type as "ESSAI1" | "ESSAI2",
                  ) && <EssaiRDV params={params} />} */}

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
                  Finaliser le compte rendu du rendez-vous
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function RendezVousForm({
  service,
  rendezVous,
  setRendezVous,
  state,
  setState,
}: {
  service: Service;
  rendezVous: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
  }[];
  state: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
  };
  setRendezVous: (
    rendezVous: {
      date: string;
      timeDebut: Time;
      timeFin: Time;
      rdvType: RendezVousType;
      modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
    }[],
  ) => void;
  setState: (state: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
    rdvType: RendezVousType;
    modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
  }) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [state]);

  const handleAddRendezVous = () => {
    if (!state.date || !state.timeDebut || !state.timeFin) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (state.timeDebut > state.timeFin) {
      setError("L'heure de début doit être inférieure à l'heure de fin");
      return;
    }

    setRendezVous([
      ...rendezVous,
      {
        date: state.date,
        timeDebut: state.timeDebut,
        timeFin: state.timeFin,
        rdvType: state.rdvType,
        modelEssaiRef: state.modelEssaiRef,
      },
    ]);

    setState({
      date: "",
      timeDebut: new Time(0, 0),
      timeFin: new Time(0, 0),
      rdvType: RendezVousType.RDV1 as RendezVousType,
      modelEssaiRef: [],
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-8 sm:grid-cols-3">
        <DatePickerComponent
          label="Date"
          selectedDate={state.date}
          onDateChange={(date) => setState({ ...state, date: date! })}
          noPastDate
        />
        <TimePickerComponent
          label="Heure de début"
          time={state.timeDebut}
          onChange={(time) => setState({ ...state, timeDebut: time })}
        />
        <TimePickerComponent
          label="Heure de fin"
          time={state.timeFin}
          onChange={(time) => setState({ ...state, timeFin: time })}
        />
        <div>
          <label
            htmlFor="etablissement"
            className="block text-sm font-medium text-gray-700"
          >
            Type de rendez-vous
          </label>
          <select
            value={state.rdvType}
            onChange={(e) =>
              setState({
                ...state,
                rdvType: e.target.value as RendezVousType,
              })
            }
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

      {state.rdvType === RendezVousType.ESSAI && (
        <EssaiRDV
          service={service}
          modelEssaiRef={state.modelEssaiRef}
          onChange={(modelEssaiRef) =>
            setState({ ...state, modelEssaiRef: modelEssaiRef })
          }
        />
      )}

      <div className="mt-6 flex items-end">
        <button
          onClick={handleAddRendezVous}
          className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Créer le rdv
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-600">
          {error}
        </div>
      )}

      {rendezVous.length > 0 && (
        <label
          htmlFor="etablissement"
          className="mb-3 mt-6 block text-sm font-medium text-gray-700"
        >
          Rdv programés :
        </label>
      )}

      <dl className="divide-y divide-gray-100 text-sm">
        {rendezVous.map((rdv, index) => (
          <div
            key={index}
            className="grid border-collapse grid-cols-5 place-items-center gap-1 border border-gray-100 py-3 shadow-sm even:bg-gray-50 sm:grid-cols-5 sm:gap-4"
          >
            <dt className="px-1 text-center font-medium text-gray-900">
              {RendezVousTypeLabels[rdv.rdvType]}
            </dt>

            <dd className="px-1 text-center text-gray-700">
              {format(new Date(rdv.date), "dd/MM/yyyy")} à{" "}
              {format(new Date(rdv.date), "HH:mm")}
            </dd>

            <dd className="col-span-2 px-1 text-center text-gray-700">
              {rdv.modelEssaiRef.map((ref, index) => (
                <>
                  <span key={ref.model.id}>{ref.model.name}</span>
                  {index !== rdv.modelEssaiRef.length - 1 && <span>, </span>}
                </>
              ))}
            </dd>

            <dd className="px-1 text-center text-gray-700">
              {/* delete button */}
              <button
                className="inline-block rounded-full p-1.5 text-gray-700 hover:bg-gray-50 focus:relative"
                title="Delete Rdv"
                onClick={() =>
                  setRendezVous(rendezVous.filter((_, i) => i !== index))
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
  );
}

function ChirRDV({ contactId }: { contactId: string }) {
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
            </>
          )}
    </>
  );
}

export function EssaiRDV({
  service,
  modelEssaiRef,
  onChange,
}: {
  service: Service;
  modelEssaiRef: { surgery: Surgery; model: Model; pose: Pose | null }[];
  onChange: (
    value: { surgery: Surgery; model: Model; pose: Pose | null }[],
  ) => void;
}) {
  const [addModelMode, setAddModelMode] = useState(false);

  const modelBySurgery = useMemo(() => {
    const modelBySurgery: Record<
      string,
      { model: Model; pose: Pose | null }[]
    > = {};

    modelEssaiRef.forEach((ref) => {
      if (modelBySurgery[ref.surgery]) {
        modelBySurgery[ref.surgery]?.push({
          model: ref.model,
          pose: ref.pose,
        });
      } else {
        modelBySurgery[ref.surgery] = [{ model: ref.model, pose: ref.pose }];
      }
    });

    return modelBySurgery;
  }, [modelEssaiRef]);

  return (
    <>
      <div className="flex flex-row-reverse items-center justify-between">
        <div
          role="button"
          onClick={() => setAddModelMode(true)}
          className="mb-4 inline-block cursor-pointer text-blue-600"
        >
          Ajouter une ref à cet essai
        </div>
      </div>

      <div className="my-6 overflow-x-auto rounded-lg border">
        <div className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <div className="block md:hidden">
            {Object.entries(SurgeriesByService[service]).map(
              ([_, value], index) => (
                <div key={index}>
                  <div className="bg-gray-50 px-4 py-2 font-bold">{value}</div>
                  <div className="px-4 py-2">
                    <ul>
                      {modelBySurgery[value]?.map((ref) => (
                        <li
                          key={`${ref.model.id}`}
                          className="group flex items-center justify-between rounded-lg p-2 transition-colors duration-300 ease-in-out hover:bg-gray-100"
                        >
                          <span className="text-medium">
                            {ref.model.name}
                            {ref.pose && (
                              <span className="text-xs uppercase text-gray-500">
                                {" "}
                                {PoseLabels[ref.pose]}
                              </span>
                            )}
                          </span>
                          <button
                            className="text-red-500 opacity-0 transition-opacity duration-300 ease-in-out hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => {
                              const newModelEssaiRef = modelEssaiRef.filter(
                                (r) => {
                                  return (
                                    r.surgery !== value ||
                                    r.model.id !== ref.model.id ||
                                    r.pose !== ref.pose
                                  );
                                },
                              );

                              onChange(newModelEssaiRef);
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
                  </div>
                </div>
              ),
            )}
          </div>
          <table className="hidden min-w-full divide-y-2 divide-gray-200 text-sm md:table">
            <thead className="bg-gray-50 text-left">
              <tr>
                {Object.values(SurgeriesByService[service]).map((s) => {
                  return (
                    <th
                      key={s}
                      className="w-1/12 px-4 py-2 text-xs md:px-8 md:py-3 md:text-sm"
                    >
                      {s}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                {Object.values(SurgeriesByService[service]).map((refs, i) => (
                  <td
                    key={i}
                    className="min-h-24 w-1/12 px-4 py-2 md:px-6 md:py-4"
                  >
                    <ul>
                      {modelBySurgery[refs]?.map((ref) => (
                        <li
                          key={`${ref.model.id}`}
                          className="group flex items-center justify-between rounded-lg p-2 transition-colors duration-300 ease-in-out hover:bg-gray-100"
                        >
                          <span className="md:text-medium text-xs">
                            {ref.model.name}
                            {ref.pose && (
                              <span className="text-xs uppercase text-gray-500">
                                {" "}
                                {PoseLabels[ref.pose]}
                              </span>
                            )}
                          </span>
                          <button
                            className="text-red-500 opacity-0 transition-opacity duration-300 ease-in-out hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => {
                              const newModelEssaiRef = modelEssaiRef.filter(
                                (r) => {
                                  return (
                                    r.surgery !== refs ||
                                    r.model.id !== ref.model.id ||
                                    r.pose !== ref.pose
                                  );
                                },
                              );

                              onChange(newModelEssaiRef);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-4 w-4 md:h-6 md:w-6"
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
            onSubmit={(type, model, pose) => {
              if (
                modelEssaiRef.some(
                  (r) => r.model.id === model.id && r.pose === pose,
                )
              ) {
                return;
              }

              const newModelEssaiRef = modelEssaiRef.concat({
                surgery: type,
                model,
                pose,
              });

              onChange(newModelEssaiRef);
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
  onSubmit: (type: Surgery, model: Model, pose: Pose | null) => void;
}) {
  const [produit, setProduit] = useState<string | undefined>(undefined);

  const [type, setType] = useState<Surgery>(
    () => SurgeriesByService[service]?.[0] ?? Surgery.HIL,
  );

  const [mono, setMono] = useState(true);

  const models = api.reference.findAllModels.useQuery({
    surgery: type,
  });

  const handleSubmit = () => {
    if (produit) {
      const model = models?.data?.find((m) => m.id === produit);

      if (!model) return;

      const pose: Pose = mono ? Pose.MONO : Pose.BILLATERAL; // Specify the type for the 'pose' variable and use the correct property name 'BILLATERAL' instead of 'BILLAT'

      onSubmit(type, model, pose);
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
              Ajouter une ref à essayer
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

          {(type === Surgery.HIC || type === Surgery.HIL) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <label className="mx-4 mb-2 flex items-center gap-4">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300"
                  name="usingSurgery"
                  checked={mono}
                  onChange={() => setMono(!mono)}
                />
                <span className="text-sm font-light text-gray-900">Mono</span>
              </label>
              <label className="mx-4 mb-2 flex items-center gap-4">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300"
                  name="usingSurgery"
                  checked={!mono}
                  onChange={() => setMono(!mono)}
                />
                <span className="text-sm font-light text-gray-900">Billat</span>
              </label>
            </div>
          )}

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
