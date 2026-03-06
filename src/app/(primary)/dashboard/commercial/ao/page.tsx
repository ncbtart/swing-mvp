"use client";

import { useEffect, useState } from "react";

import SearchInput from "@/app/_components/core/SearchInput";
import { api } from "@/trpc/react";

import { debounce } from "lodash";

import {
  EtablissementType,
  Fabricant,
  SourceAO,
  TypeMarche,
} from "@prisma/client";
import { differenceInCalendarYears, format } from "date-fns";
import { SourceLabel, TypeMarcheLabels } from "@/utils/constantes";
import Link from "next/link";
import { GenericPaginator } from "@/app/_components/core/GenericTable";

export default function AO() {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInputValue);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearch(searchInputValue);
    }, 300);

    handler();

    // Nettoyez l'effet en annulant la fonction debounced si le composant est démonté
    // ou si `searchInputValue` change avant que le délai ne soit écoulé.
    return () => {
      handler.cancel();
    };
  }, [searchInputValue]);

  const [skip, setSkip] = useState(0);

  const { data: etablissements, isPending } =
    api.etablissement.findAll.useQuery({
      skip,
      take: 10,
      search: debouncedSearch,
      etablissementType: EtablissementType.HOPITAL,
    });

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Synthèse AO
          </h1>

          <div className="mt-4 flex items-center justify-between">
            <div></div>

            <div className="flex flex-row">
              <SearchInput
                placeholder="Rechercher ..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
            </div>
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
            <div className="mt-6 rounded-lg border border-gray-200">
              <div className="overflow-x-auto rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Dept
                      </th>
                      <th className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Nom
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Ville
                      </th>
                      {Object.values(SourceAO).map((source) => (
                        <th
                          key={source}
                          className="w-1/6 whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                        >
                          {SourceLabel[source]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {etablissements?.data.map((etablissement) => (
                      <tr key={etablissement.id}>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {etablissement.departement?.code}
                        </td>
                        <td className="max-w-60 px-4 py-2 text-gray-700">
                          <Link
                            href={`/dashboard/etablissements/fiche/${etablissement.id}?o=2`}
                            className="text-blue-800"
                          >
                            {etablissement.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {etablissement.ville}
                        </td>
                        {Object.values(SourceAO).map((source) => (
                          <td
                            key={source}
                            className="whitespace-nowrap px-4 py-2 text-gray-700"
                          >
                            {(() => {
                              const ao = etablissement.EtablissementAO.find(
                                (ao) => ao.source.source === source,
                              );

                              if (ao) {
                                return (
                                  <div className="flex flex-col">
                                    {Object.values(TypeMarche).map((type) => {
                                      const marche = ao.source.marche.find(
                                        (marche) => marche.type === type,
                                      );

                                      const isFabricant =
                                        marche?.lot[0]?.fabricant ===
                                        Fabricant.SWING;

                                      if (
                                        marche &&
                                        differenceInCalendarYears(
                                          new Date(),
                                          ao.source.dateFin,
                                        ) < -1
                                      ) {
                                        return (
                                          <div
                                            key={type}
                                            className="grid grid-cols-[auto,auto,auto] gap-0 text-xs"
                                          >
                                            <span
                                              className={`font-semibold ${isFabricant ? "text-green-500" : "text-red-500"}`}
                                            >
                                              {TypeMarcheLabels[type]}
                                            </span>
                                            <span>
                                              {format(
                                                ao.source.dateDebut,
                                                "dd/MM/yyyy",
                                              )}
                                            </span>

                                            <span>
                                              {format(
                                                ao.source.dateFin,
                                                "dd/MM/yyyy",
                                              )}
                                            </span>
                                          </div>
                                        );
                                      }

                                      if (
                                        marche &&
                                        differenceInCalendarYears(
                                          new Date(),
                                          ao.source.dateFin,
                                        ) >= -1
                                      ) {
                                        return (
                                          <div
                                            key={type}
                                            className="grid grid-cols-[auto,auto,auto,auto] gap-0 text-xs"
                                          >
                                            <span
                                              className={`font-semibold ${isFabricant ? "text-green-500" : "text-red-500"}`}
                                            >
                                              {TypeMarcheLabels[type]}
                                            </span>
                                            <span>
                                              {format(
                                                ao.source.dateDebut,
                                                "dd/MM/yyyy",
                                              )}
                                            </span>

                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              className="h-4 w-4 text-red-500"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                clipRule="evenodd"
                                              />
                                            </svg>

                                            <span className="text-red-500">
                                              {format(
                                                ao.source.dateFin,
                                                "dd/MM/yyyy",
                                              )}
                                            </span>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                );
                              }
                            })()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <GenericPaginator
                total={etablissements?.total ?? 0}
                take={10}
                skip={skip}
                onPageChange={setSkip}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
