import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { paginationSchema } from "@/server/schema";
import { RoleName } from "@prisma/client";

const extendedPaginationSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const secteurRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(extendedPaginationSchema)
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Vous n'avez pas l'autorisation de voir les secteurs");
      }

      let where = {};

      if (input.search) {
        where = {
          name: {
            contains: input.search,
            mode: "insensitive",
          },
        };
      }

      const secteurs = await ctx.db.secteur.findMany({
        where,
        orderBy: { name: "asc" },
        skip: input.skip,
        take: input.take,
      });

      const total = await ctx.db.secteur.count({ where });

      return { data: secteurs, total };
    }),

  findOne: protectedProcedure
    .input(
      z.object({
        secteurId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // check if the user is admin or in the same secteur

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        const userSecteur = await ctx.db.secteur.findFirst({
          where: {
            secteurUser: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        });

        if (!userSecteur) {
          throw new Error("Vous n'avez pas l'autorisation de voir ce secteur");
        }
      }

      return ctx.db.secteur.findFirst({
        where: { id: input.secteurId },
        include: {
          secteurUser: {
            select: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  role: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          departement: {
            select: {
              id: true,
              code: true,
              name: true,
            },
            orderBy: {
              code: "asc",
            },
          },
        },
      });
    }),
});
