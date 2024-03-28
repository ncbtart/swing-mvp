import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

type Env = {
  NODE_ENV: string;
};

const createPrismaClient = () =>
  new PrismaClient({
    log:
      (env as Env).NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if ((env as Env).NODE_ENV !== "production") globalForPrisma.prisma = db;
