"use client";

import DatePickerComponent from "@/app/_components/core/DatePicker";
import { GenericPaginator } from "@/app/_components/core/GenericTable";
import TimePickerComponent from "@/app/_components/core/TimePicker";
import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { RendezVousTypeLabels, ServiceLabels } from "@/utils/constantes";
import type {
  Chirurgien,
  ChirurgienRendezVous,
  RendezVous,
} from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

import { Time } from "@internationalized/date";
import { useRouter } from "next/navigation";

interface ChirurgienRendezVousFeed extends ChirurgienRendezVous {
  rendezVous: RendezVous;
  chirurgien: Chirurgien;
}

export default function Activities() {
  const [skip, setSkip] = useState(0);

  const {
    data: activities,
    isPending,
    refetch,
  } = api.activite.finAllByChirurgien.useQuery({
    skip,
    take: 10,
    me: true,
    status: false,
  });

  const router = useRouter();

  const { setTitle, openPopup, setMessage } = usePopup();

  const [deleteActivity, setDeleteActivity] = useState<
    ChirurgienRendezVousFeed | undefined
  >();

  const [changeActivity, setChangeActivity] = useState<
    ChirurgienRendezVousFeed | undefined
  >();

  const deleteActivityMutation = api.activite.delete.useMutation({
    onSuccess: async () => {
      setTitle("Rendez-vous supprimé");
      setMessage("Rendez-vous supprimé avec succès");
      openPopup();
      await refetch();
    },
  });

  const changeActivityMutation = api.activite.updateDate.useMutation({
    onSuccess: async () => {
      setTitle("Rendez-vous modifié");
      setMessage("Rendez-vous modifié avec succès");
      openPopup();
      await refetch();
    },
  });

  const handleDeleteActivity = async () => {
    if (!deleteActivity) return;

    await deleteActivityMutation.mutateAsync({
      id: deleteActivity.id,
    });

    setDeleteActivity(undefined);
  };

  const handleChangeAcivity = async (form: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
  }) => {
    if (!changeActivity) return;

    const date = new Date(form.date);
    date.setHours(form.timeDebut.hour);
    date.setMinutes(form.timeDebut.minute);

    const dateFin = new Date(form.date);
    dateFin.setHours(form.timeFin.hour);
    dateFin.setMinutes(form.timeFin.minute);

    await changeActivityMutation.mutateAsync({
      id: changeActivity.id,
      date,
      dateFin,
    });

    setChangeActivity(undefined);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Saisie Activités
          </h1>

          <Link
            href="/dashboard/commercial/activite/create"
            className="mt-4 inline-block text-blue-600"
          >
            Nouveau rendez-vous
          </Link>

          {isPending ? (
            // loading animation
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
            <div className="mt-6 rounded-lg border border-gray-200">
              <div className="overflow-x-auto rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="w-1/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Date
                      </th>
                      <th className="w-1/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Heure
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Etablissement
                      </th>
                      <th className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Service
                      </th>
                      <th className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Contact
                      </th>
                      <th className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities?.data.map((activite) => (
                      <tr key={activite.id}>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {format(activite.rendezVous.date, "dd/MM/yyyy")}
                        </td>
                        <td className="max-w-60 px-4 py-2 text-gray-700">
                          {format(activite.rendezVous.date, "HH:mm")}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {activite?.chirurgien.etablissement.name}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {activite?.chirurgien.service &&
                            ServiceLabels[activite.chirurgien.service]}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          <Link
                            href={`/dashboard/contact/fiche/${activite.chirurgien.id}`}
                            className="text-blue-600"
                          >
                            {activite.chirurgien.firstname}{" "}
                            {activite.chirurgien.lastname}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {RendezVousTypeLabels[activite.rendezVous.type]}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          <div className="text-center">
                            <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                              <button
                                className="inline-block border-e p-3 text-gray-700 hover:bg-gray-50 focus:relative"
                                title="Edit Activity"
                                onClick={() => setChangeActivity(activite)}
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
                              </button>

                              <button
                                className="inline-block border-e p-3 text-gray-900 hover:bg-gray-50 focus:relative"
                                title="Delete activity"
                                onClick={() => setDeleteActivity(activite)}
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

                              <button
                                className={`inline-block p-3 text-green-700  ${activite.rendezVous.dateFin < new Date() ? "hover:bg-green-50" : ""} focus:relative`}
                                title="Valider Secteur"
                                disabled={
                                  activite.rendezVous.dateFin < new Date()
                                    ? false
                                    : true
                                }
                                onClick={() =>
                                  router.push(
                                    `/dashboard/commercial/activite/fiche/${activite.id}`,
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="h-5 w-5 font-bold"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <GenericPaginator
                total={activities?.total ?? 0}
                take={10}
                skip={0}
                onPageChange={(newSkip) => {
                  setSkip(newSkip);
                }}
              />
            </div>
          )}
        </main>
      </div>
      {deleteActivity && (
        <>
          <div
            role="alert"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="rounded-xl border border-gray-100 bg-white p-8">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <strong className="block font-medium text-gray-900">
                    Supprimer le rendez-vous
                  </strong>

                  <p className="mt-2 text-sm text-gray-700">
                    Êtes-vous sûr de vouloir supprimer le rendez-vous du{" "}
                    <strong>
                      {format(deleteActivity.rendezVous.date, "dd/MM/yyyy")}
                    </strong>{" "}
                    avec{" "}
                    <strong>
                      {deleteActivity.chirurgien.firstname}{" "}
                      {deleteActivity.chirurgien.lastname}
                    </strong>
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                      onClick={() => setDeleteActivity(undefined)}
                    >
                      <span className="text-sm">Annuler</span>
                    </button>

                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                      onClick={handleDeleteActivity}
                    >
                      <span className="text-sm">Valider</span>
                    </button>
                  </div>
                </div>

                <button
                  className="text-gray-500 transition hover:text-gray-600"
                  onClick={() => setDeleteActivity(undefined)}
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
      {changeActivity && (
        <EditActivity
          setChangeActivity={setChangeActivity}
          onConfirm={(form) => handleChangeAcivity(form)}
          activity={changeActivity}
        />
      )}
    </div>
  );
}

interface EditActivityProps {
  setChangeActivity: (activity: ChirurgienRendezVousFeed | undefined) => void;
  onConfirm: (activity: {
    date: string;
    timeDebut: Time;
    timeFin: Time;
  }) => Promise<void>;
  activity: ChirurgienRendezVousFeed;
}

const EditActivity = ({
  setChangeActivity,
  onConfirm,
  activity,
}: EditActivityProps) => {
  const [form, setForm] = useState({
    date: "",
    timeDebut: new Time(0, 0),
    timeFin: new Time(0, 0),
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleChangeActivity = async () => {
    setErrorMessage(undefined);

    const currentDate = new Date();

    // Soustrayez un jour
    currentDate.setDate(currentDate.getDate() - 1);

    if (!form.date || !form.timeDebut || !form.timeFin) {
      setErrorMessage("Veuillez remplir tous les champs");
      return;
    }

    if (new Date(form.date) < currentDate) {
      setErrorMessage("La date ne peut pas être dans le passé");
      return;
    }

    if (form.timeDebut > form.timeFin) {
      setErrorMessage("L'heure de début doit être inférieure à l'heure de fin");
      return;
    }

    await onConfirm({ ...form });
  };

  return (
    <>
      <div
        role="alert"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="rounded-xl border border-gray-100 bg-white p-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="mt-2 text-sm text-gray-700">
                Êtes-vous sûr de vouloir reporter le rendez-vous du{" "}
                <strong>
                  {format(activity.rendezVous.date, "dd/MM/yyyy")}
                </strong>{" "}
                avec{" "}
                <strong>
                  {activity.chirurgien.firstname} {activity.chirurgien.lastname}
                </strong>
              </p>

              <div className="mt-6 grid grid-cols-3 gap-8 sm:grid-cols-3">
                <div>
                  <DatePickerComponent
                    label="Date du rendez-vous"
                    selectedDate={form.date}
                    onDateChange={(date) => {
                      setForm({ ...form, date: date! });
                    }}
                    noPastDate
                  />
                </div>
                <TimePickerComponent
                  label="Heure du rendez-vous"
                  time={form.timeDebut}
                  onChange={(time) => {
                    setForm({ ...form, timeDebut: time });
                  }}
                />

                <div>
                  <TimePickerComponent
                    label="Fin du rendez-vous"
                    time={form.timeFin}
                    onChange={(time) => {
                      setForm({ ...form, timeFin: time });
                    }}
                  />
                </div>
              </div>

              {
                <p className="mt-2 text-sm text-red-600">
                  {errorMessage && <span>{errorMessage}</span>}
                </p>
              }

              <div className="mt-4 flex gap-2">
                <button
                  className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setChangeActivity(undefined)}
                >
                  <span className="text-sm">Annuler</span>
                </button>

                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  onClick={handleChangeActivity}
                >
                  <span className="text-sm">Valider</span>
                </button>
              </div>
            </div>

            <button
              className="text-gray-500 transition hover:text-gray-600"
              onClick={() => setChangeActivity(undefined)}
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
  );
};
