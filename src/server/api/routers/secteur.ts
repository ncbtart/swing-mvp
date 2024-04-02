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

  edit: protectedProcedure
    .input(
      z.object({
        secteurId: z.string(),
        name: z.string(),
        departementIds: z.array(z.string()),
        commerciauxIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { secteurId, name, departementIds, commerciauxIds } = input;
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier ce secteur",
        );
      }

      const departementsExist = await ctx.db.departement.count({
        where: {
          id: {
            in: departementIds,
          },
        },
      });

      if (departementsExist !== departementIds.length) {
        throw new Error(
          "Un ou plusieurs départements spécifiés n'existent pas",
        );
      }

      // Vérifier l'existence des utilisateurs
      const usersExist = await ctx.db.user.count({
        where: {
          id: {
            in: commerciauxIds,
          },
        },
      });

      if (usersExist !== commerciauxIds.length) {
        throw new Error(
          "Un ou plusieurs utilisateurs spécifiés n'existent pas",
        );
      }

      // Mise à jour du secteur et des départements
      await ctx.db.secteur.update({
        where: { id: secteurId },
        data: {
          name,
          departement: {
            set: [],
            connect: departementIds.map((id) => ({ id })),
          },
        },
      });

      // Supprimer les relations SecteurUser existantes pour ce secteur
      await ctx.db.secteurUser.deleteMany({
        where: {
          secteurId,
        },
      });

      // Créer de nouvelles relations SecteurUser
      for (const userId of commerciauxIds) {
        await ctx.db.secteurUser.create({
          data: {
            secteurId,
            userId,
          },
        });
      }

      // Renvoyer le secteur mis à jour (sans les détails des relations pour simplifier)
      return ctx.db.secteur.findUnique({
        where: { id: secteurId },
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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        departementIds: z.array(z.string()),
        commerciauxIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, departementIds, commerciauxIds } = input;
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier ce secteur",
        );
      }

      const departementsExist = await ctx.db.departement.count({
        where: {
          id: {
            in: departementIds,
          },
        },
      });

      if (departementsExist !== departementIds.length) {
        throw new Error(
          "Un ou plusieurs départements spécifiés n'existent pas",
        );
      }

      // Vérifier l'existence des utilisateurs
      const usersExist = await ctx.db.user.count({
        where: {
          id: {
            in: commerciauxIds,
          },
        },
      });

      if (usersExist !== commerciauxIds.length) {
        throw new Error(
          "Un ou plusieurs utilisateurs spécifiés n'existent pas",
        );
      }

      // Mise à jour du secteur et des départements
      const secteur = await ctx.db.secteur.create({
        data: {
          name,
          departement: {
            connect: departementIds.map((id) => ({ id })),
          },
        },
      });

      // Créer de nouvelles relations SecteurUser
      for (const userId of commerciauxIds) {
        await ctx.db.secteurUser.create({
          data: {
            secteurId: secteur.id,
            userId,
          },
        });
      }

      // Renvoyer le secteur créé (sans les détails des relations pour simplifier)
      return ctx.db.secteur.findUnique({
        where: { id: secteur.id },
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

  delete: protectedProcedure
    .input(
      z.object({
        secteurId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de supprimer ce secteur",
        );
      }

      await ctx.db.secteurUser.deleteMany({
        where: {
          secteurId: input.secteurId,
        },
      });

      await ctx.db.secteur.delete({
        where: {
          id: input.secteurId,
        },
      });

      // remove all secteurUser relations

      return true;
    }),
});
