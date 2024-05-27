import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  Attribution,
  Fabricant,
  RoleName,
  SourceAO,
  TypeMarche,
} from "@prisma/client";

export const aoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        source: z.nativeEnum(SourceAO),
        name: z.string(),
        numero: z.string(),
        consultation: z.string(),
        dateDebut: z.string(),
        dateFin: z.string(),
        objet: z.string(),
        etablissements: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }
      const ao = await ctx.db.source.create({
        data: {
          source: input.source,
          name: input.name,
          numero: input.numero,
          consultation: input.consultation,
          dateDebut: input.dateDebut,
          dateFin: input.dateFin,
          objet: input.objet,
          etablissementAO: {
            createMany: {
              data: input.etablissements?.map((id) => ({
                etablissementId: id,
              })),
            },
          },
          createdBy: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      return ao;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        source: z.nativeEnum(SourceAO),
        name: z.string(),
        numero: z.string(),
        consultation: z.string(),
        dateDebut: z.string(),
        dateFin: z.string(),
        objet: z.string(),
        etablissements: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }

      const ao = await ctx.db.source.update({
        where: {
          id: input.id,
        },
        data: {
          source: input.source,
          name: input.name,
          numero: input.numero,
          consultation: input.consultation,
          dateDebut: input.dateDebut,
          dateFin: input.dateFin,
          objet: input.objet,
          etablissementAO: {
            deleteMany: {},
            createMany: {
              data: input.etablissements?.map((id) => ({
                etablissementId: id,
              })),
            },
          },
        },
      });

      return ao;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }

      await ctx.db.lot.deleteMany({
        where: {
          marche: {
            sourceId: input.id,
          },
        },
      });

      await ctx.db.etablissementAO.deleteMany({
        where: {
          sourceId: input.id,
        },
      });

      await ctx.db.marche.deleteMany({
        where: {
          sourceId: input.id,
        },
      });

      const ao = await ctx.db.source.delete({
        where: {
          id: input.id,
        },
      });

      return ao;
    }),

  validateAo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.boolean().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }

      if (!input.status) {
        const old = await ctx.db.source.findFirst({
          where: {
            id: input.id,
          },
        });

        if (!old) {
          throw new Error("AO not found");
        }

        const ao = await ctx.db.source.update({
          where: {
            id: input.id,
          },
          data: {
            status: !old.status,
          },
        });

        return ao;
      } else {
        const ao = await ctx.db.source.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
          },
        });

        return ao;
      }
    }),

  findAll: protectedProcedure
    .input(
      z.object({
        skip: z.number().optional().default(0),
        take: z.number().optional().default(10),
        secteurId: z.string().nullable().optional(),
        etablissementId: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        // find etablisement of user secteur
        const user = await ctx.db.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          include: {
            SecteurUser: {
              include: {
                secteur: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const ao = await ctx.db.source.findMany({
          where: {
            etablissementAO: {
              some: {
                etablissement: {
                  departement: {
                    secteurId: {
                      in: user.SecteurUser.map((s) => s.secteurId),
                    },
                  },
                },
              },
            },
          },
          include: {
            etablissementAO: {
              include: {
                source: {
                  include: {
                    marche: true,
                  },
                },
                etablissement: {
                  include: {
                    departement: {
                      include: {
                        secteur: true,
                      },
                    },
                  },
                },
              },
            },
            createdBy: true,
          },
          skip: input.skip,
          take: input.take,
          orderBy: {
            createdAt: "desc",
          },
        });

        const total = await ctx.db.source.count({
          where: {
            etablissementAO: {
              some: {
                etablissement: {
                  departement: {
                    secteurId: {
                      in: user.SecteurUser.map((s) => s.secteurId),
                    },
                  },
                },
              },
            },
          },
        });

        return { data: ao, total };
      }

      let whereClause = {};

      if (input.secteurId) {
        whereClause = {
          ...whereClause,
          etablissementAO: {
            some: {
              etablissement: {
                departement: {
                  secteurId: input.secteurId,
                },
              },
            },
          },
        };
      }

      if (input.etablissementId) {
        whereClause = {
          ...whereClause,
          etablissementAO: {
            some: {
              etablissementId: input.etablissementId,
            },
          },
        };
      }

      if (input.search) {
        whereClause = {
          ...whereClause,
          OR: [
            {
              name: {
                contains: input.search,
                mode: "insensitive",
              },
            },
            {
              numero: {
                contains: input.search,
              },
            },
            {
              etablissementAO: {
                some: {
                  etablissement: {
                    name: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            {
              etablissementAO: {
                some: {
                  etablissement: {
                    departement: {
                      secteur: {
                        name: {
                          contains: input.search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        };
      }

      const ao = await ctx.db.source.findMany({
        where: whereClause,
        include: {
          etablissementAO: {
            include: {
              source: {
                include: {
                  marche: true,
                },
              },
              etablissement: {
                include: {
                  departement: {
                    include: {
                      secteur: true,
                    },
                  },
                },
              },
            },
          },
          createdBy: true,
        },
        skip: input.skip,
        take: input.take,
        orderBy: {
          createdAt: "desc",
        },
      });

      const total = await ctx.db.source.count({
        where: whereClause,
      });

      return { data: ao, total };
    }),

  findLastEditedByMe: protectedProcedure.query(async ({ ctx }) => {
    // check if user is admin

    const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

    if (!isAdmin) {
      throw new Error("Not authorized");
    }

    const ao = await ctx.db.source.findFirst({
      where: {
        status: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        etablissementAO: {
          include: {
            etablissement: true,
          },
        },
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

    return ao;
  }),
  findById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }

      const ao = await ctx.db.source.findFirst({
        where: {
          id: input.id,
        },
        include: {
          etablissementAO: {
            include: {
              etablissement: true,
            },
          },
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

      return ao;
    }),

  createLot: protectedProcedure
    .input(
      z.object({
        aoId: z.string(),
        type: z.nativeEnum(TypeMarche),
        attribution: z.nativeEnum(Attribution),
        fabricant: z.nativeEnum(Fabricant).nullable().optional(),
        numero: z.string(),
        name: z.string(),
        produits: z.array(
          z.object({
            produitId: z.string().nullable().optional(),
            produitName: z.string().nullable().optional(),
            modeleId: z.string().nullable().optional(),
            modeleName: z.string().nullable().optional(),
            prix: z.number().nullable().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }
      //create marche if dont exist and then add lot
      const existingMarche = await ctx.db.marche.findFirst({
        where: {
          type: input.type,
          sourceId: input.aoId,
        },
      });

      let marcheId;

      if (!existingMarche) {
        const newMarche = await ctx.db.marche.create({
          data: {
            type: input.type,
            source: {
              connect: { id: input.aoId },
            },
          },
        });
        marcheId = newMarche.id;
      } else {
        marcheId = existingMarche.id;
      }

      const lot = await ctx.db.lot.create({
        data: {
          attribution: input.attribution,
          name: input.name,
          numero: input.numero,
          fabricant: input.fabricant,
          marche: {
            connect: { id: marcheId },
          },
          productLot: {
            createMany: {
              data: input.produits.map((produit) => ({
                // if prodruiId is null connect modelId

                productId: produit.produitId,
                modelId: produit.modeleId,
                prix: produit.prix,
              })),
            },
          },
        },
        include: {
          marche: true,
          productLot: {
            include: {
              product: true,
              model: true,
            },
          },
        },
      });

      return lot;
    }),
  editLot: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.nativeEnum(TypeMarche),
        attribution: z.nativeEnum(Attribution),
        fabricant: z.nativeEnum(Fabricant).nullable().optional(),
        numero: z.string(),
        name: z.string(),
        produits: z.array(
          z.object({
            produitId: z.string().nullable().optional(),
            produitName: z.string().nullable().optional(),
            modeleId: z.string().nullable().optional(),
            modeleName: z.string().nullable().optional(),
            prix: z.number().nullable().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }
      const lot = await ctx.db.lot.update({
        where: {
          id: input.id,
        },
        data: {
          attribution: input.attribution,
          name: input.name,
          numero: input.numero,
          fabricant: input.fabricant,
          productLot: {
            deleteMany: {},
            createMany: {
              data: input.produits.map((produit) => ({
                productId: produit.produitId,
                modelId: produit.modeleId,
                prix: produit.prix,
              })),
            },
          },
        },
        include: {
          marche: true,
          productLot: {
            include: {
              product: true,
              model: true,
            },
          },
        },
      });

      return lot;
    }),

  deleteLot: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role.name === RoleName.ADMIN;

      if (!isAdmin) {
        throw new Error("Not authorized");
      }

      await ctx.db.productLot.deleteMany({
        where: {
          lotId: input.id,
        },
      });

      const marche = await ctx.db.marche.findFirst({
        where: {
          lot: {
            some: {
              id: input.id,
            },
          },
        },

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
      });

      await ctx.db.lot.delete({
        where: {
          id: input.id,
        },
      });

      // if last lot of marche delete marche
      if (marche?.lot.length === 1) {
        await ctx.db.marche.delete({
          where: {
            id: marche.id,
          },
        });
      }

      return true;
    }),
});
