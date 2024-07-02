"use client";

import { useEffect, useState } from "react";

import ButtonGroup from "@/app/_components/core/ButtonGroup";
import SearchInput from "@/app/_components/core/SearchInput";
import { api } from "@/trpc/react";

import { debounce } from "lodash";

import GenericTable from "@/app/_components/core/GenericTable";
import Link from "next/link";

import { EtablissementType } from "@prisma/client";

export default function Etablissements() {
  const [etablissementType, setEtablissementType] =
    useState<EtablissementType>();

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
      etablissementType,
    });

  const handleActiveChange = (label: string) => {
    console.log(label);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Liste Établissements
          </h1>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <ButtonGroup
                buttons={[
                  {
                    label: "Tous",
                    onClick: () => setEtablissementType(undefined),
                  },
                  {
                    label: "Hopital",
                    onClick: () =>
                      setEtablissementType(EtablissementType.HOPITAL),
                  },

                  {
                    label: "Clinique",
                    onClick: () =>
                      setEtablissementType(EtablissementType.CLINIQUE),
                  },
                ]}
                onActiveChange={handleActiveChange}
              />
            </div>

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
            <GenericTable
              data={etablissements?.data ?? []}
              columns={[
                {
                  key: "isClient",
                  title: "Client",
                  render: (isClient) => {
                    return (
                      <span
                        className={`text-sm font-bold ${
                          isClient ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isClient ? "Oui" : "Non"}
                      </span>
                    );
                  },
                },
                {
                  key: "type",
                  title: "Type",
                  render: (type) => {
                    return (
                      <span className="text-sm font-bold">
                        {type === EtablissementType.HOPITAL
                          ? "Hopital"
                          : "Clinique"}
                      </span>
                    );
                  },
                },
                {
                  key: "name",
                  title: "Raison Sociale",
                  render: (name) => (
                    <Link
                      href={`/dashboard/etablissements/fiche/${etablissements?.data
                        .find((etablissement) => etablissement.name === name)
                        ?.id?.toString()}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      <span>{name as string}</span>
                    </Link>
                  ),
                },
                {
                  key: "codePostal",
                  title: "Code Postal",
                },
                {
                  key: "ville",
                  title: "Ville",
                },
              ]}
              skip={skip}
              take={10}
              total={etablissements?.total ?? 0}
              onPageChange={(skip) => {
                setSkip(skip);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
