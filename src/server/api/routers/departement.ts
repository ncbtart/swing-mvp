import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const departementRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    const departements = await ctx.db.departement.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return departements;
  }),
});
