"use client";

import { usePopup } from "@/app/_hooks/usePopUp";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useState } from "react";

export default function Account() {
  const { data: me, isPending } = api.user.findMe.useQuery();

  const { setTitle, setMessage, openPopup } = usePopup();

  const [editPasswordMode, setEditPasswordMode] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editPassword = api.user.changePassword.useMutation({
    onSuccess: () => {
      setEditPasswordMode(false);
      setTitle("Mot de passe modifié");
      setMessage("Votre mot de passe a été modifié avec succès");
      openPopup();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleEditPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const body = {
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
    };

    if (body.password !== body.passwordConfirm) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (body.password && body.password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    editPassword.mutate({
      password: body.password,
      passwordConfirm: body.passwordConfirm,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 pb-16">
      <div className="flex-grow">
        <main className="my-0">
          <h1 className="text-xl font-medium text-black sm:text-2xl">
            Mes informations
          </h1>
          <div className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/** profil default svg */}
            <div className="col-span-1">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <Image
                    width="156"
                    height="156"
                    alt="Default pfp"
                    src="/img/default.png"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <button className="text-blue-600 hover:underline">
                  Modifier
                </button>
              </div>
            </div>

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
              <div className="col-span-2 mx-auto w-full">
                <div className="flow-root  rounded-lg border border-gray-100 py-3 shadow-sm">
                  <dl className="-my-3 divide-y divide-gray-100 text-sm">
                    <div className="grid grid-cols-1 gap-1 bg-white p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                      <dt className="font-medium text-gray-900">Nom</dt>
                      <dd className="text-gray-700 sm:col-span-2">
                        {me?.lastname}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-1 bg-white p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                      <dt className="font-medium text-gray-900">Prénom</dt>
                      <dd className="text-gray-700 sm:col-span-2">
                        {me?.firstname}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-1 bg-white p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                      <dt className="font-medium text-gray-900">Email</dt>
                      <dd className="text-gray-700 sm:col-span-2">
                        {me?.email}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-1 bg-white p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                      <dt className="font-medium text-gray-900">Téléphone</dt>
                      <dd className="text-gray-700 sm:col-span-2">
                        {me?.phone}
                      </dd>
                    </div>
                    <div
                      className={`grid grid-cols-1 gap-1 bg-white p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4 ${editPasswordMode ? "sm:row-span-2" : ""}`}
                    >
                      <dt className="font-medium text-gray-900">
                        Mot de passe
                      </dt>
                      <dd className="text-gray-700 sm:col-span-2">
                        {editPasswordMode ? (
                          <form onSubmit={handleEditPassword}>
                            <label htmlFor="lastname" className="sr-only">
                              Mot de passe
                            </label>

                            <div className="relative">
                              <input
                                type="password"
                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                placeholder="Mot de passe"
                                name="password"
                                required
                              />
                            </div>

                            <label htmlFor="lastname" className="sr-only">
                              Validation mot de passe
                            </label>

                            <div className="relative mt-2">
                              <input
                                type="password"
                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                placeholder="Validation mot de passe"
                                name="passwordConfirm"
                                required
                              />
                            </div>

                            {errorMessage && (
                              <div className="mt-2 text-red-600">
                                {errorMessage}
                              </div>
                            )}

                            <div className="mt-4 flex flex-row-reverse gap-2">
                              <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                              >
                                <span className="text-sm">Valider</span>
                              </button>

                              <button
                                className="block rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                                onClick={() => setEditPasswordMode(false)}
                              >
                                <span className="text-sm">Annuler</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => setEditPasswordMode(true)}
                            id="edit-password"
                          >
                            Modifier
                          </button>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
