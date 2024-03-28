import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const roleRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    const roles = await ctx.db.role.findMany({
      orderBy: { name: "asc" },
    });

    return roles;
  }),
});
