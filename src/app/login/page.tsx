"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function Page() {
  const [error, setError] = useState<boolean>(false);

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const body = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    await signIn("credentials", {
      username: body.username as string,
      password: body.password as string,
      redirect: false,
    }).then((res) => {
      if (!res?.ok) {
        setError(true);
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
          Swing Technologies CRM
        </h1>

        <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati
          sunt dolores deleniti inventore quaerat mollitia?
        </p>

        <form
          className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8"
          onSubmit={handleSubmit}
        >
          <p className="text-center text-lg font-medium">
            Connectez vous à votre compte
          </p>

          <div>
            <label htmlFor="username" className="sr-only">
              Identifant
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Entrez votre identifiant"
                name="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>

            <div className="relative">
              <input
                type="password"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Entrez votre mot de passe"
                name="password"
              />

              <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            </div>

            {error && (
              <p className="mt-2 text-center text-sm text-red-600">
                Identifiant ou mot de passe incorrect
              </p>
            )}
          </div>

          <button
            type="submit"
            className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={() => signIn("google")}
            className="block w-full rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white"
          >
            Connexion avec Google
          </button>
        </form>
      </div>
    </div>
  );
}
