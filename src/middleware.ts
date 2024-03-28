import { RoleName } from "@prisma/client";
import { withAuth } from "next-auth/middleware";

import type { NextRequestWithAuth } from "next-auth/middleware";

import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    if (
      req.nextUrl.pathname.startsWith("/dashboard/users") &&
      req.nextauth.token?.role.name !== RoleName.ADMIN
    ) {
      // Redirect to the denied page if the user is not an admin
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    // Matches the pages config in `[...nextauth]`

    pages: {
      signIn: "/login",
      error: "/error",
    },
  },
);
