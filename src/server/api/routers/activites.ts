import { RendezVousType, RoleName, Surgery } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";

export const activitesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        dateFin: z.date(),
        chirurgienIds: z.array(z.string()),
        rdvType: z.nativeEnum(RendezVousType),
        modelEssai: z
          .array(
            z.object({
              modelId: z.string(),
              surgery: z.nativeEnum(Surgery),
            }),
          )
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const placeRDV = await ctx.db.chirurgien.findFirst({
        where: {
          id: {
            in: input.chirurgienIds,
          },
        },
        select: {
          etablissementId: true,
        },
      });

      if (!placeRDV) {
        throw new Error("Chirurgien not found");
      }

      const rdvAlreadyExist = await ctx.db.rendezVous.findFirst({
        where: {
          commercialId: ctx.session.user.id,
          chirurgiens: {
            some: {
              chirurgien: {
                etablissementId: {
                  not: placeRDV.etablissementId,
                },
              },
            },
          },
          date: {
            lte: input.dateFin,
            gte: input.date,
          },
        },
      });

      if (rdvAlreadyExist) {
        throw new Error("Un rendez-vous existe déjà à cette date");
      }

      const rdv = await ctx.db.rendezVous.create({
        data: {
          commercialId: ctx.session.user.id,
          date: input.date,
          dateFin: input.dateFin,
          type: input.rdvType,
          chirurgiens: {
            createMany: {
              data: input.chirurgienIds.map((id) => ({
                chirurgienId: id,
              })),
            },
          },
          ModelEssaiRendezVous: {
            createMany: {
              data:
                input.modelEssai?.map((model) => ({
                  modelId: model.modelId,
                  surgery: model.surgery,
                })) ?? [],
            },
          },
        },
      });

      return rdv;
    }),

  updateDate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
        dateFin: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rdv = await ctx.db.rendezVous.update({
        where: {
          id: input.id,
        },
        data: {
          date: input.date,
          dateFin: input.dateFin,
        },
      });

      return rdv;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.chirurgienRendezVous.delete({
        where: {
          id: input.id,
        },
      });
    }),

  findAll: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(10),
        search: z.string().optional(),
        etablissementId: z.string().optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let whereClause = {
        commercialId: ctx.session.user.id,
        chirurgiens: {},
      };

      if (input.etablissementId) {
        whereClause = {
          ...whereClause,
          chirurgiens: {
            some: {
              chirurgien: {
                etablissementId: input.etablissementId,
              },
            },
          },
        };
      }

      const rdvs = await ctx.db.rendezVous.findMany({
        where: whereClause,
        take: input.take,
        skip: input.skip,
        orderBy: {
          date: "asc",
        },
        include: {
          chirurgiens: {
            include: {
              chirurgien: {
                include: {
                  etablissement: true,
                },
              },
            },
          },
        },
      });

      const total = await ctx.db.rendezVous.count({
        where: whereClause,
      });

      return { data: rdvs, total };
    }),

  finAllByChirurgien: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(10),
        status: z.boolean().optional().nullable(),
        me: z.boolean().optional().nullable(),
        etablissementId: z.string().optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // check if the user has the right to see the data

      if (input.me && ctx.session.user.role.name !== RoleName.ADMIN) {
        throw new Error("Unauthorized");
      }

      let whereClause = {};

      if (input.status !== undefined) {
        whereClause = {
          ...whereClause,
          done: input.status,
        };
      }

      if (input.me) {
        whereClause = {
          ...whereClause,
          rendezVous: {
            commercialId: ctx.session.user.id,
          },
        };
      }

      if (input.etablissementId) {
        whereClause = {
          ...whereClause,
          chirurgien: {
            etablissementId: input.etablissementId,
          },
        };
      }

      const rdvs = await ctx.db.chirurgienRendezVous.findMany({
        take: input.take,
        skip: input.skip,
        orderBy: {
          rendezVous: {
            date: "asc",
          },
        },
        where: whereClause,
        include: {
          chirurgien: {
            include: {
              etablissement: true,
            },
          },
          rendezVous: true,
        },
      });

      const total = await ctx.db.chirurgienRendezVous.count({
        where: whereClause,
      });

      return { data: rdvs, total };
    }),

  findOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rdv = await ctx.db.rendezVous.findUnique({
        where: {
          id: input.id,
        },
        include: {
          ModelEssaiRendezVous: {
            include: {
              model: true,
            },
          },
          chirurgiens: {
            include: {
              chirurgien: {
                include: {
                  etablissement: true,
                },
              },
            },
          },
        },
      });

      if (!rdv) {
        throw new Error("Rendez-vous not found");
      }

      if (
        rdv.commercialId !== ctx.session.user.id &&
        ctx.session.user.role.name !== RoleName.ADMIN
      ) {
        throw new Error("Unauthorized");
      }

      return rdv;
    }),
  findOneByChirurgien: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rdv = await ctx.db.chirurgienRendezVous.findUnique({
        where: {
          id: input.id,
        },
        include: {
          chirurgien: {
            include: {
              etablissement: true,
            },
          },
          rendezVous: true,
        },
      });

      if (!rdv) {
        throw new Error("Rendez-vous not found");
      }

      return rdv;
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
        observation: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rdv = await ctx.db.chirurgienRendezVous.findFirst({
        where: {
          id: input.id,
        },
        include: {
          rendezVous: true,
        },
      });

      if (!rdv) {
        throw new Error("Rendez-vous not found");
      }

      if (
        rdv.rendezVous.commercialId !== ctx.session.user.id &&
        ctx.session.user.role.name !== RoleName.ADMIN
      ) {
        throw new Error("Unauthorized");
      }

      return await ctx.db.chirurgienRendezVous.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.done,
          observation: input.observation,
        },
      });
    }),
});
