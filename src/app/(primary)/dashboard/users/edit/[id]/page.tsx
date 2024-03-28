"use client";

import { useState } from "react";

import Link from "next/link";

import { api } from "@/trpc/react";
import { RoleNameLabels } from "@/utils/constantes";
import { usePopup } from "@/app/_hooks/usePopUp";
import { useRouter } from "next/navigation";

export default function UserEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { data: roles } = api.role.findAll.useQuery();

  const [newPassword, setNewPassword] = useState<boolean>(false);

  const handleNewPassword = () => {
    setNewPassword((prev) => !prev);
  };

  const {
    data: user,
    isLoading,
    refetch,
  } = api.user.findOne.useQuery(
    {
      userId: params.id,
    },
    {
      enabled: !!params.id,
    },
  );

  const editMutation = api.user.edit.useMutation({
    onSuccess: async () => {
      router.push("/dashboard/users");
      openPopup();
      setTitle("Utilisateur modifié");
      setMessage("L'utilisateur a été modifié avec succès");
      await refetch();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  console.log(params.id);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setTitle, setMessage, openPopup } = usePopup();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const body = {
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      email: formData.get("email")
        ? (formData.get("email") as string)
        : undefined,
      roleId: formData.get("roleId") as string,
    };

    editMutation.mutate({
      userId: params.id,
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      roleId: body.roleId,
      password: formData.get("password")
        ? (formData.get("password") as string)
        : undefined,
      passwordConfirm: formData.get("passwordConfirm")
        ? (formData.get("passwordConfirm") as string)
        : undefined,
    });
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col px-4 pb-16 pt-8">
        <div className="flex-grow">
          <main className="my-0">
            <h1 className="text-xl text-black sm:text-2xl">
              Édition utilisateur
            </h1>

            <Link
              href="/dashboard/users"
              className="mt-4 inline-block text-blue-600"
            >
              <span className="mb-3 mr-3 text-blue-600">←</span>
              Retour à la liste des utilisateurs
            </Link>

            {isLoading ? (
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
                        defaultValue={user?.lastname ?? ""}
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
                        defaultValue={user?.firstname ?? ""}
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
                        defaultValue={user?.email ?? ""}
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

                  <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                    {roles?.map((role) => {
                      console.log(role);
                      console.log(user?.role.id);

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
                            defaultChecked={role.id === user?.role.id}
                          />

                          <span className="text-sm">
                            {RoleNameLabels[role.name]}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div
                    className="mt-6 inline-block cursor-pointer text-blue-600"
                    onClick={handleNewPassword}
                  >
                    Nouveau mot de passe
                  </div>

                  {newPassword && (
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
                  )}

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
            )}
          </main>
        </div>
      </div>
    </>
  );
}
