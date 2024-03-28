"use client";

import { useState } from "react";

import Link from "next/link";

import { api } from "@/trpc/react";
import { RoleNameLabels } from "@/utils/constantes";
import { useRouter } from "next/navigation";
import { usePopup } from "@/app/_hooks/usePopUp";

export default function UserCreatePage() {
  const router = useRouter();

  const { data: roles } = api.role.findAll.useQuery();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard/users");
      setTitle("Utilisateur ajouté");
      setMessage("L'utilisateur a été ajouté avec succès");
      openPopup();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const body = {
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      email: formData.get("email")
        ? (formData.get("email") as string)
        : undefined,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
      roleId: formData.get("roleId") as string,
    };

    if (body.password !== body.passwordConfirm) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (body.password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    createUser.mutate(body);
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col px-4 pb-16 pt-8">
        <div className="flex-grow">
          <main className="my-0">
            <h1 className="text-xl text-black sm:text-2xl">
              Ajouter un utilisateur
            </h1>

            <Link
              href="/dashboard/users"
              className="mt-4 inline-block text-blue-600"
            >
              <span className="mb-3 mr-3 text-blue-600">←</span>
              Retour à la liste des utilisateurs
            </Link>

            <div className="mt-6 rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <label htmlFor="lastname" className="sr-only">
                    Nom
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Nom"
                      name="lastname"
                      required
                    />
                  </div>

                  <label htmlFor="firstname" className="sr-only">
                    Prénom
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Prénom"
                      name="firstname"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <label htmlFor="lastname" className="sr-only">
                    Email
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Email"
                      name="email"
                    />
                  </div>

                  <label htmlFor="lastname" className="sr-only">
                    Téléphone
                  </label>

                  <div className="relative">
                    <input
                      type="tel"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Téléphone"
                      name="téléphone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <label htmlFor="lastname" className="sr-only">
                    Mot de passe
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Mot de passe"
                      name="password"
                      onChange={() => setErrorMessage(null)}
                      required
                    />
                  </div>

                  <label htmlFor="lastname" className="sr-only">
                    Validation mot de passe
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                      placeholder="Validation mot de passe"
                      name="passwordConfirm"
                      required
                      onChange={() => setErrorMessage(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                  {roles?.map((role) => {
                    return (
                      <label
                        key={role.id}
                        htmlFor={role.name}
                        className="mt-6 block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                        tabIndex={0}
                      >
                        <input
                          className="sr-only"
                          id={role.name}
                          value={role.id}
                          type="radio"
                          tabIndex={-1}
                          name="roleId"
                        />

                        <span className="text-sm">
                          {RoleNameLabels[role.name]}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {errorMessage && (
                  <div className="mt-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-4 flex flex-row-reverse">
                  <button
                    type="submit"
                    className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white sm:w-auto"
                  >
                    Sauvegarder l&apos;utilisateur
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
