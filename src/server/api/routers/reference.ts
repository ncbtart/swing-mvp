import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { paginationSchema } from "@/server/schema";
import { Fabricant, RoleName, Surgery } from "@prisma/client";

import { z } from "zod";

const extendedPaginationSchema = paginationSchema.extend({
  search: z.string().optional(),
  fabricant: z.nativeEnum(Fabricant).optional(),
  surgery: z.nativeEnum(Surgery).optional(),
});

export const referenceRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(extendedPaginationSchema)
    .query(async ({ ctx, input }) => {
      // check if authorized

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de supprimer ce secteur",
        );
      }

      let whereClause = {};

      if (input.search) {
        whereClause = {
          OR: [{ reference: { contains: input.search, mode: "insensitive" } }],
        };
      }

      if (input.fabricant) {
        whereClause = {
          ...whereClause,
          fabricant: input.fabricant,
        };
      }

      if (input.surgery && input.surgery.length > 0) {
        whereClause = {
          ...whereClause,
          surgery: { has: input.surgery },
        };
      }

      const references = await ctx.db.product.findMany({
        where: whereClause,
        take: input.take,
        skip: input.skip,
        orderBy: { reference: "asc" },
      });

      const count = await ctx.db.product.count({ where: whereClause });

      return { data: references, total: count };
    }),

  findOne: protectedProcedure
    .input(
      z.object({
        referenceId: z.string(),
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

      return ctx.db.product.findFirst({
        where: { id: input.referenceId },
        include: {
          models: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        referenceId: z.string(),
        reference: z.string(),
        surgeries: z.nativeEnum(Surgery).array(),
        fabricant: z.nativeEnum(Fabricant),
        models: z.object({ id: z.string(), name: z.string() }).array(),
        newModels: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier ce secteur",
        );
      }

      const reference = await ctx.db.product.update({
        include: {
          models: true,
        },
        where: { id: input.referenceId },
        data: {
          surgery: { set: input.surgeries },
          reference: input.reference,
          fabricant: input.fabricant,
          models: {
            deleteMany: {
              id: {
                notIn: input.models
                  .filter((model) => model.id)
                  .map((model) => model.id),
              },
            },
            createMany: {
              data: input.newModels.map((model) => ({
                name: model,
              })),
            },
          },
        },
      });

      return reference;
    }),
  create: protectedProcedure
    .input(
      z.object({
        reference: z.string(),
        surgeries: z.nativeEnum(Surgery).array(),
        fabricant: z.nativeEnum(Fabricant),
        models: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Vous n'avez pas l'autorisation de créer ce secteur");
      }

      const reference = await ctx.db.product.create({
        data: {
          surgery: { set: input.surgeries },
          reference: input.reference,
          fabricant: input.fabricant,
          models: {
            createMany: {
              data: input.models.map((model) => ({
                name: model,
              })),
            },
          },
        },
      });

      return reference;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        referenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error(
          "Vous n'avez pas l'autorisation de supprimer ce secteur",
        );
      }

      await ctx.db.product.delete({
        where: { id: input.referenceId },
      });

      return true;
    }),
});
