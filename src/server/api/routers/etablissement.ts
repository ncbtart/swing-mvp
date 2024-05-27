import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { paginationSchema } from "@/server/schema";
import { EtablissementType, RoleName } from "@prisma/client";

import { z } from "zod";

const extendedPaginationSchema = paginationSchema.extend({
  search: z.string().optional(),
  etablissementType: z.nativeEnum(EtablissementType).optional(),
  secteurId: z.string().optional(),
});

export const etablissementtRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(extendedPaginationSchema)
    .query(async ({ ctx, input }) => {
      // check if admin or in commercial team

      let whereClause = {};

      if (input.search) {
        whereClause = {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            {
              ville: { contains: input.search, mode: "insensitive" },
            },
            {
              codePostal: { startsWith: input.search, mode: "insensitive" },
            },
          ],
        };
      }

      if (input.etablissementType) {
        whereClause = {
          ...whereClause,
          type: input.etablissementType,
        };
      }

      if (input.secteurId) {
        whereClause = {
          ...whereClause,
          departement: {
            secteurId: input.secteurId,
          },
        };
      }

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          include: {
            SecteurUser: {
              include: {
                secteur: true,
              },
            },
          },
        });

        whereClause = {
          ...whereClause,
          departement: {
            secteur: {
              id: {
                in: currentUser?.SecteurUser.map((s) => s.secteurId),
              },
            },
          },
        };
      }

      const etablissements = await ctx.db.etablissement.findMany({
        where: whereClause,
        take: input.take,
        skip: input.skip,
        orderBy: { codePostal: "asc" },
        include: {
          departement: {
            include: {
              secteur: true,
            },
          },
          EtablissementAO: {
            include: {
              source: {
                include: {
                  marche: {
                    include: {
                      lot: {
                        include: {
                          productLot: {
                            include: {
                              product: true,
                              model: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const total = await ctx.db.etablissement.count({
        where: whereClause,
      });

      return { data: etablissements, total };
    }),
  findOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // check if admin or in commercial team

      const etablissement = await ctx.db.etablissement.findUnique({
        where: { id: input.id },
        include: {
          departement: {
            include: {
              secteur: true,
            },
          },
        },
      });

      if (!etablissement) {
        throw new Error("Etablissement not found");
      }

      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          SecteurUser: {
            include: {
              secteur: true,
            },
          },
        },
      });

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (
        !isAdmin &&
        !currentUser?.SecteurUser.some(
          (secteurUser) =>
            secteurUser.secteurId === etablissement?.departement?.secteurId,
        )
      ) {
        throw new Error("Vous n'avez pas l'autorisation de voir ces données");
      }

      return etablissement;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        status: z.boolean(),
        isClient: z.boolean(),
        central: z.string().nullable().optional(),
        group: z.string().nullable().optional(),
        adresse: z.string(),
        adresseComp: z.string().optional(),
        codePostal: z.string(),
        ville: z.string(),
        telephone: z.string(),
        type: z.nativeEnum(EtablissementType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if admin or in commercial team

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Vous n'avez pas l'autorisation de voir ces données");
      }

      const departement = await ctx.db.departement.findFirst({
        where: {
          code: {
            startsWith: input.codePostal.slice(0, 2),
          },
        },
      });

      if (!departement) {
        throw new Error("Département not found");
      }

      const etablissement = await ctx.db.etablissement.create({
        data: {
          name: input.name,
          status: input.status,
          isClient: input.isClient,
          adresse: input.adresse,
          adresseComp: input.adresseComp,
          codePostal: input.codePostal,
          group: input.group,
          central: input.central,
          ville: input.ville,
          telephone: input.telephone,
          type: input.type,
          departementId: departement.id,
        },
      });

      return etablissement;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check if admin or in commercial team

      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Vous n'avez pas l'autorisation de voir ces données");
      }

      const etablissement = await ctx.db.etablissement.findUnique({
        where: { id: input.id },
      });

      if (!etablissement) {
        throw new Error("Etablissement not found");
      }

      await ctx.db.etablissement.delete({
        where: { id: input.id },
      });

      return etablissement;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        status: z.boolean(),
        isClient: z.boolean(),
        adresse: z.string(),
        adresseComp: z.string().nullable().optional(),
        group: z.string().nullable().optional(),
        central: z.string().nullable().optional(),
        codePostal: z.string(),
        ville: z.string(),
        telephone: z.string(),
        type: z.nativeEnum(EtablissementType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if admin or in commercial team
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Vous n'avez pas l'autorisation de voir ces données");
      }

      const departement = await ctx.db.departement.findFirst({
        where: {
          code: {
            startsWith: input.codePostal.slice(0, 2),
          },
        },
      });

      if (!departement) {
        throw new Error("Département not found");
      }

      const etablissement = await ctx.db.etablissement.update({
        where: { id: input.id },
        data: {
          name: input.name,
          status: input.status,
          isClient: input.isClient,
          adresse: input.adresse,
          adresseComp: input.adresseComp,
          group: input.group,
          central: input.central,
          codePostal: input.codePostal,
          ville: input.ville,
          telephone: input.telephone,
          type: input.type,
          departementId: departement.id,
        },
      });

      return etablissement;
    }),
  findSourcesEtabablissement: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sources = await ctx.db.source.findMany({
        where: {
          etablissementAO: {
            some: {
              etablissementId: input.id,
              source: {
                dateFin: {
                  gte: new Date(),
                },
              },
            },
          },
        },
        include: {
          marche: {
            include: {
              lot: {
                include: {
                  productLot: {
                    include: {
                      product: true,
                      model: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return sources;
    }),
});
