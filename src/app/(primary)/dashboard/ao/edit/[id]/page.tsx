"use client";

import { usePannierAo } from "@/app/_hooks/usePannierAo";

import Image from "next/image";

import { useState, useEffect } from "react";
import { EtablissementStep, LotsStep, RecapStep } from "../../create/page";

export default function EditAo({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(0);

  const { form, clearLot, lot, findById } = usePannierAo();

  useEffect(() => {
    if (!!params.id && form.id !== params.id) {
      findById(params.id);
    }
  }, [params.id, form.id, findById]);

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <div className="relative mt-2 rounded-lg bg-white p-6 shadow-lg lg:col-span-3 lg:p-12">
            <h1 className="text-center text-xl font-medium uppercase text-black sm:text-2xl">
              Modification Appel d&apos;Offre
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
                      className="size-7 shrink-0"
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
