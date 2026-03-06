import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";

import GoogleProvider from "next-auth/providers/google";

import { db } from "@/server/db";

import CredentialsProvider from "next-auth/providers/credentials";
import { validatePassword } from "./utils";
import type { Role } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
    accessToken?: string; // Ajouter l'access token de Google
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user, account, profile }) {

      if (account && account.provider === "google") {
        token.accessToken = account.access_token;


        // Vérifier si l'utilisateur existe dans la base de données
        const dbUser = await db.user.findUnique({
          where: {
            email: profile?.email,
          },
          include: {
            role: true,
          },
        });


        if (!dbUser) {
          throw new Error("User not found");
        }

        token.role = dbUser.role;
        token.id = dbUser.id;

        return token;
      }

      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {

      session.user.role = token.role;
      session.user.id = token.id;
      session.user.accessToken = token.accessToken;

      return session;
    },
    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = await db.user.findFirst({
          where: {
            username: credentials!.username,
          },
          include: {
            role: true,
          },
        });

        if (
          user &&
          (await validatePassword(credentials!.password, user.password!))
        ) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user.id,
            name: user.username,
            role: user.role,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60 * 180,
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
