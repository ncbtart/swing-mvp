import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { paginationSchema } from "@/server/schema";
import { SurgeriesByService } from "@/utils/constantes";
import {
  type Chirurgien,
  EtablissementType,
  RoleName,
  type Surgery,
  type Product,
  Service,
  Fabricant,
  RendezVousType,
} from "@prisma/client";

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
  avancement: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      type SurgeryAvancement = {
        surgery: Surgery;
        avancement: number;
        products: Product[];
      };

      type SurgeryUsageMap = Record<
        string,
        {
          isUsing: boolean;
          avancement: number | undefined;
          products: { product: Product }[] | undefined;
        }
      >;

      type ReferenceMap = Record<string, number>;

      type RendezVousMap = Record<
        string,
        {
          done: boolean;
          type: RendezVousType;
          products: { product: Product; validation: boolean }[];
        }
      >;

      const table: {
        chirurgien: Chirurgien;
        surgeries: SurgeryAvancement[];
        avancementChir: number;
      }[] = [];

      const chirurgiens = await ctx.db.chirurgien.findMany({
        where: {
          etablissement: {
            id: input.id,
          },
          service: {
            in: [
              Service.CHIR_DIGESTIF, // Chirurgie Digestive
              Service.CHIR_GINECO, // Chirurgie Gynécologique
              Service.CHIR_UROLOGIE, // Chirurgie Urologique
            ],
          },
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
          references: {
            include: {
              product: true,
            },
            where: {
              product: {
                fabricant: Fabricant.SWING,
              },
            },
          },
          ChirurgienRendezVous: {
            include: {
              rendezVous: {
                include: {
                  ModelEssaiRendezVous: {
                    include: {
                      model: {
                        include: {
                          product: true,
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

      chirurgiens.forEach((chirurgien) => {
        const surgeries: SurgeryAvancement[] = [];

        const surgeryUsageMap: SurgeryUsageMap = chirurgien.usingSurgery.reduce(
          (acc, s) => {
            acc[s.surgery] = {
              isUsing: true,
              avancement: s?.avancement?.avancement,
              products: s?.avancement?.products,
            };
            return acc;
          },
          {} as SurgeryUsageMap,
        );

        const referenceMap: ReferenceMap = chirurgien.references.reduce(
          (acc, ref) => {
            acc[ref.surgery] = ref.product ? 4 : 0;
            return acc;
          },
          {} as ReferenceMap,
        );

        const rendezVousMap: RendezVousMap =
          chirurgien.ChirurgienRendezVous.reduce((acc, rdv) => {
            rdv.rendezVous.ModelEssaiRendezVous.forEach((modelEssai) => {
              if (!acc[modelEssai.surgery]) {
                acc[modelEssai.surgery] = {
                  done: rdv.done,
                  type: rdv.rendezVous.type,
                  products: [],
                };
              }

              // check if product is not already in the list
              if (
                !acc[modelEssai.surgery]?.products.some(
                  (p) => p.product.id === modelEssai.model.product.id,
                )
              ) {
                acc[modelEssai.surgery]?.products.push({
                  product: modelEssai.model.product,
                  validation: modelEssai.validation,
                });
              }
            });
            return acc;
          }, {} as RendezVousMap);

        SurgeriesByService[chirurgien.service].forEach((surgery) => {
          if (surgeryUsageMap[surgery]?.isUsing === false) {
            surgeries.push({ surgery, avancement: 0, products: [] });
          } else if (referenceMap[surgery] === 4) {
            surgeries.push({
              surgery,
              avancement: 4,
              products: chirurgien.references
                .filter((ref) => ref.surgery === surgery)
                .map((ref) => ref.product),
            });
          } else {
            const rendezVous = rendezVousMap[surgery];
            if (!rendezVous) {
              if (surgeryUsageMap[surgery]?.avancement) {
                surgeries.push({
                  surgery,
                  avancement: surgeryUsageMap[surgery]?.avancement ?? 1,
                  products:
                    surgeryUsageMap[surgery]?.products?.map((p) => p.product) ??
                    [],
                });
              } else {
                surgeries.push({ surgery, avancement: 1, products: [] });
              }
            } else if (
              rendezVous.done &&
              rendezVous.type === RendezVousType.ESSAI
            ) {
              surgeries.push({
                surgery,
                avancement: 3,
                products: rendezVous.products.map((p) => p.product),
              });
            } else {
              surgeries.push({
                surgery,
                avancement: 2,
                products: rendezVous.products.map((p) => p.product),
              });
            }
          }
        });

        const avancementChir = surgeries.reduce(
          (acc, s) => (s.avancement > acc ? s.avancement : acc),
          0,
        );

        table.push({ chirurgien, surgeries, avancementChir });
      });

      return table;
    }),
});
