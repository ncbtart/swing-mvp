"use client";

import DatePickerComponent from "@/app/_components/core/DatePicker";
import { GenericPaginator } from "@/app/_components/core/GenericTable";
import TimePickerComponent from "@/app/_components/core/TimePicker";
import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import { RendezVousTypeLabels, ServiceLabels } from "@/utils/constantes";
import {
  RoleName,
  type Chirurgien,
  type ChirurgienRendezVous,
  type RendezVous,
} from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Time } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/app/_hooks/useSession";
import SearchInput from "@/app/_components/core/SearchInput";
import { debounce } from "lodash";
import Image from "next/image";

interface ChirurgienRendezVousFeed extends ChirurgienRendezVous {
  rendezVous: RendezVous;
  chirurgien: Chirurgien;
}

export default function Activities() {
  const { session } = useSessionContext();

  if (session?.user.role.name === RoleName.COMMERCIAL) {
    return <CommercialVue />;
  }

  if (session?.user.role.name === RoleName.ADMIN) {
    return <AdminVue />;
  }
}

function CommercialVue() {
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
      id: changeActivity.rendezVousId,
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
            <>
              {activities && activities.total === 0 && (
                <>
                  <div className="mt-12 flex h-96 flex-col items-center justify-center">
                    <Image
                      src="/img/no_appointment.svg"
                      alt="No data"
                      width={600}
                      height={600}
                    />
                  </div>
                </>
              )}

              {activities && activities.total > 0 && (
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
                            <td
                              className={`whitespace-nowrap px-4 py-2 text-center font-medium text-gray-700`}
                            >
                              {activite.rendezVous.date < new Date() && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="mb-1 size-4 w-full"
                                >
                                  <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}

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
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="h-4 w-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
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
            </>
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

              <div className="mt-6 flex gap-2">
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

function AdminVue() {
  const [skip, setSkip] = useState(0);

  const [secteursFilter, setSecteursFilter] = useState<string | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    secteursFilter,
  );

  const { data: secteurs } = api.secteur.findAll.useQuery({});

  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearch(searchInputValue);
    }, 300);

    handler();

    return () => {
      handler.cancel();
    };
  }, [searchInputValue]);

  const { data: activities, isPending } =
    api.activite.finAllByChirurgien.useQuery({
      skip,
      take: 10,
      search: debouncedSearch,
      secteurId: secteursFilter,
      order: "desc",
    });

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Liste Rendez-Vous Commerciaux
          </h1>

          <div className="mt-4 flex items-center justify-end space-x-4">
            <select
              className="w-48 rounded-md p-2 shadow-sm dark:border-gray-700"
              onChange={(e) => setSecteursFilter(e.target.value)}
            >
              <option value="">Secteur</option>
              {secteurs?.data.map((secteur) => (
                <option key={secteur.id} value={secteur.id}>
                  {secteur.name}
                </option>
              ))}
            </select>

            <SearchInput
              placeholder="Rechercher ..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
          </div>

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
            <>
              {activities && activities.total === 0 && (
                <>
                  <p className="mt-6 text-center text-gray-700">
                    Aucun rendez-vous trouvé
                  </p>

                  <div className="flex h-96 flex-col items-center justify-center">
                    <Image
                      src="/img/no_appointment.svg"
                      alt="No data"
                      width={300}
                      height={300}
                    />
                  </div>
                </>
              )}
              {activities && activities.total > 0 && (
                <div className="mt-6 rounded-lg border border-gray-200">
                  <div className="overflow-x-auto rounded-t-lg">
                    <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                      <thead className="text-left">
                        <tr>
                          <th className="w-1/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                            Commercial
                          </th>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activities?.data.map((activite) => (
                          <tr key={activite.id}>
                            <td className="px-4 py-2 text-gray-700">
                              {activite?.rendezVous.commercial.firstname}{" "}
                              {activite?.rendezVous.commercial.lastname}
                            </td>
                            <td
                              className={`whitespace-nowrap px-4 py-2 font-medium text-gray-700`}
                            >
                              {format(activite.rendezVous.date, "dd/MM/yyyy")}
                            </td>
                            <td className="max-w-60 px-4 py-2 text-gray-700">
                              {format(activite.rendezVous.date, "HH:mm")}
                            </td>
                            <td className="px-4 py-2">
                              <Link
                                href={`/dashboard/etablissements/fiche/${activite.chirurgien.etablissement.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {activite?.chirurgien.etablissement.name}
                              </Link>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
