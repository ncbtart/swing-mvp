import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  Civilite,
  Fonction,
  Jour,
  RoleName,
  Service,
  Surgery,
} from "@prisma/client";

import { z } from "zod";

export const chirurgienRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(
      z.object({
        etablissementId: z.string().optional().nullable(),
        service: z.nativeEnum(Service).optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let whereClause = {};

      if (ctx.session.user.role.name !== RoleName.ADMIN) {
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
          throw new Error("Utilisateur introuvable");
        }

        whereClause = {
          etablissement: {
            departement: {
              secteur: {
                id: {
                  in: user?.SecteurUser.map((s) => s.secteurId),
                },
              },
            },
          },
        };
      }

      if (input.etablissementId) {
        whereClause = {
          ...whereClause,
          etablissementId: input.etablissementId,
        };
      }

      if (input.service) {
        whereClause = {
          ...whereClause,
          service: input.service,
        };
      }

      const chirurgiens = await ctx.db.chirurgien.findMany({
        orderBy: { lastname: "asc" },
        where: whereClause,
      });

      return chirurgiens;
    }),
  findOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const chirurgien = await ctx.db.chirurgien.findUnique({
        where: {
          id: input.id,
        },
        include: {
          etablissement: true,
          references: {
            include: {
              product: true,
            },
          },
          usingSurgery: true,
        },
      });

      if (!chirurgien) {
        throw new Error("Chirurgien introuvable");
      }

      return chirurgien;
    }),
  create: protectedProcedure
    .input(
      z.object({
        etablissementId: z.string(),
        lastname: z.string(),
        firstname: z.string(),
        phone: z.string(),
        phone2: z.string().optional(),
        fonction: z.nativeEnum(Fonction),
        email: z.string().email(),
        civilite: z.nativeEnum(Civilite),
        joursBloc: z.array(z.nativeEnum(Jour)),
        joursConsult: z.array(z.nativeEnum(Jour)),
        service: z.nativeEnum(Service),
        isDiffusion: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chirurgien = await ctx.db.chirurgien.create({
        data: {
          ...input,
        },
      });

      return chirurgien;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chirurgien = await ctx.db.chirurgien.delete({
        where: {
          id: input.id,
        },
      });

      return chirurgien;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        lastname: z.string(),
        firstname: z.string(),
        phone: z.string(),
        phone2: z.string().nullable().optional(),
        fonction: z.nativeEnum(Fonction),
        email: z.string(),
        civilite: z.nativeEnum(Civilite),
        joursBloc: z.array(z.nativeEnum(Jour)),
        joursConsult: z.array(z.nativeEnum(Jour)),
        service: z.nativeEnum(Service),
        isDiffusion: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chirurgien = await ctx.db.chirurgien.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
        },
      });

      return chirurgien;
    }),
  addReference: protectedProcedure
    .input(
      z.object({
        chirurgienId: z.string(),
        productId: z.string(),
        surgery: z.nativeEnum(Surgery),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const produit = await ctx.db.product.findUnique({
        where: {
          id: input.productId,
        },
      });

      if (!produit) {
        throw new Error("Produit introuvable");
      }

      await ctx.db.referenceChir.create({
        data: {
          chirurgienId: input.chirurgienId,
          productId: input.productId,
          surgery: input.surgery,
        },
      });

      const usingSurgery = await ctx.db.usingSurgery.findFirst({
        where: {
          chirurgienId: input.chirurgienId,
          surgery: input.surgery,
        },
      });

      if (!usingSurgery) {
        await ctx.db.usingSurgery.create({
          data: {
            chirurgienId: input.chirurgienId,
            surgery: input.surgery,
            isUsing: true,
          },
        });
      } else {
        await ctx.db.usingSurgery.update({
          where: {
            id: usingSurgery.id,
          },
          data: {
            isUsing: true,
          },
        });
      }

      const chirurgien = await ctx.db.chirurgien.findUnique({
        where: {
          id: input.chirurgienId,
        },
        include: {
          references: {
            include: {
              product: true,
            },
          },
        },
      });

      return chirurgien;
    }),

  deleteReference: protectedProcedure
    .input(
      z.object({
        chirurgienId: z.string(),
        productId: z.string(),
        surgery: z.nativeEnum(Surgery),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.referenceChir.deleteMany({
        where: {
          chirurgienId: input.chirurgienId,
          productId: input.productId,
          surgery: input.surgery,
        },
      });

      const chirurgien = await ctx.db.chirurgien.findUnique({
        where: {
          id: input.chirurgienId,
        },
        include: {
          references: {
            include: {
              product: true,
            },
          },
        },
      });

      return chirurgien;
    }),
  updateUsingSurgery: protectedProcedure
    .input(
      z.object({
        chirurgienId: z.string(),
        surgery: z.nativeEnum(Surgery),
        using: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.usingSurgery.deleteMany({
        where: {
          chirurgienId: input.chirurgienId,
          surgery: input.surgery,
        },
      });

      await ctx.db.usingSurgery.create({
        data: {
          chirurgienId: input.chirurgienId,
          surgery: input.surgery,
          isUsing: input.using,
        },
      });

      // delete all ref for this chirurgien surgery
      if (!input.using) {
        await ctx.db.referenceChir.deleteMany({
          where: {
            chirurgienId: input.chirurgienId,
            surgery: input.surgery,
          },
        });
      }

      const chirurgien = await ctx.db.chirurgien.findUnique({
        where: {
          id: input.chirurgienId,
        },
        include: {
          usingSurgery: true,
        },
      });

      return chirurgien;
    }),
  setTapp: protectedProcedure
    .input(
      z.object({
        chirurgienId: z.string(),
        tapp: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const useHic = await ctx.db.usingSurgery.updateMany({
        where: {
          chirurgienId: input.chirurgienId,
          surgery: Surgery.HIC,
        },
        data: {
          isTapp: input.tapp,
        },
      });

      if (!useHic) {
        return await ctx.db.usingSurgery.create({
          data: {
            chirurgienId: input.chirurgienId,
            surgery: Surgery.HIC,
            isTapp: input.tapp,
          },
        });
      }

      return useHic;
    }),
  setTep: protectedProcedure
    .input(
      z.object({
        chirurgienId: z.string(),
        tep: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const useHic = await ctx.db.usingSurgery.updateMany({
        where: {
          chirurgienId: input.chirurgienId,
          surgery: Surgery.HIC,
        },
        data: {
          isTep: input.tep,
        },
      });

      if (!useHic) {
        return await ctx.db.usingSurgery.create({
          data: {
            chirurgienId: input.chirurgienId,
            surgery: Surgery.HIC,
            isTep: input.tep,
          },
        });
      }

      return useHic;
    }),

  getAvancementHistorique: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.chirurgien.findUnique({
        where: {
          id: input.contactId,
        },
        include: {
          usingSurgery: {
            include: {
              avancement: {
                include: {
                  products: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return contact;
    }),
  setAvancementHistorique: protectedProcedure
    .input(
      z.object({
        chirugienId: z.string(),
        surgery: z.nativeEnum(Surgery),
        avancement: z.number(),
        products: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usingSurgery = await ctx.db.usingSurgery.findFirst({
        where: {
          chirurgienId: input.chirugienId,
          surgery: input.surgery,
        },
        include: {
          avancement: true,
        },
      });

      if (!usingSurgery?.avancement) {
        const newUsingSurgery = await ctx.db.usingSurgery.create({
          data: {
            chirurgienId: input.chirugienId,
            surgery: input.surgery,
          },
        });

        await ctx.db.avancement.create({
          data: {
            UsingSurgery: {
              connect: {
                id: newUsingSurgery.id,
              },
            },
            avancement: input.avancement,
            products: {
              create: input.products.map((p) => ({
                productId: p,
              })),
            },
          },
        });
      } else {
        console.log("Update surgery");

        await ctx.db.avancement.update({
          where: {
            id: usingSurgery.avancement.id,
          },
          data: {
            avancement: input.avancement,
            products: {
              deleteMany: {},
              create: input.products.map((p) => ({
                productId: p,
              })),
            },
          },
        });
      }

      return await ctx.db.chirurgien.findUnique({
        where: {
          id: input.chirugienId,
        },
        include: {
          usingSurgery: {
            include: {
              avancement: {
                include: {
                  products: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
});
