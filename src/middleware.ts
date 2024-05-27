import { RoleName } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Définition d'une map associant les chemins d'accès aux rôles autorisés
const pathRolesMap = {
  "/dashboard/users": [RoleName.ADMIN] as RoleName[],
  "/dashboard/secteurs": [RoleName.ADMIN] as RoleName[],
  "/dashboard/references": [RoleName.ADMIN] as RoleName[],
  "/dashboard/ao": [RoleName.ADMIN] as RoleName[],
};

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;

    // Itération sur la map pour vérifier l'accès
    for (const [path, allowedRoles] of Object.entries(pathRolesMap)) {
      if (
        pathname.startsWith(path) &&
        !!req.nextauth.token?.role.name &&
        !allowedRoles.includes(req.nextauth.token?.role.name)
      ) {
        // Si le rôle de l'utilisateur n'est pas autorisé, rediriger vers la page d'accueil
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    pages: {
      signIn: "/login",
      error: "/error",
    },
  },
);
