import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { roleRouter } from "./routers/role";
import { secteurRouter } from "./routers/secteur";
import { departementRouter } from "./routers/departement";
import { referenceRouter } from "./routers/reference";
import { etablissementtRouter } from "./routers/etablissement";
import { chirurgienRouter } from "./routers/chirurgien";
import { aoRouter } from "./routers/ao";
import { activitesRouter } from "./routers/activites";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  role: roleRouter,
  secteur: secteurRouter,
  departement: departementRouter,
  reference: referenceRouter,
  etablissement: etablissementtRouter,
  chirurgien: chirurgienRouter,
  source: aoRouter,
  activite: activitesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
