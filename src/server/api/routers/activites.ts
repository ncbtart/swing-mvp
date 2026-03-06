import {
  Pose,
  RendezVousType,
  RoleName,
  Service,
  Surgery,
} from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";
import {
  createCalendarEvent,
  createDedicatedCalendar,
  deleteCalendarEvent,
  getAuthClient,
  updateCalendarEvent,
} from "@/utils/google.api";
import {
  CiviliteLabels,
  RendezVousTypeLabels,
  ServiceLabels,
} from "@/utils/constantes";
import sendMail from "@/utils/mail";
import { format } from "date-fns";

interface ErrorType {
  code: number;
  message: string;
  status: string;
}

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
              pose: z.nativeEnum(Pose).optional().nullable(),
            }),
          )
          .optional()
          .nullable(),
        lastRdvId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      let calendarId = user.googleCalendarId;

      const authClient = await getAuthClient(ctx.session.user.accessToken!);

      if (!calendarId) {
        const newCalendar = await createDedicatedCalendar(
          authClient,
          `SWING Calendrier`,
        );

        if (!newCalendar.id) {
          throw new Error("Google Calendar ID not found");
        }

        calendarId = newCalendar.id;

        await ctx.db.user.update({
          where: { id: user.id },
          data: { googleCalendarId: calendarId },
        });
      }

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

          prevRendezVousId: input.lastRdvId,
          ModelEssaiRendezVous: {
            createMany: {
              data:
                input.modelEssai?.map((model) => ({
                  modelId: model.modelId,
                  surgery: model.surgery,
                  pose: model.pose,
                })) ?? [],
            },
          },
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

      let colorId;

      if (rdv.type === RendezVousType.ESSAI) {
        colorId = "10";
      } else {
        switch (rdv.chirurgiens[0]?.chirurgien?.service) {
          case Service.CHIR_DIGESTIF:
            colorId = "9";
            break;
          case Service.CHIR_GINECO:
            colorId = "5";
            break;
          case Service.CHIR_UROLOGIE:
            colorId = "4";
            break;
          case Service.PHARMACIE:
            colorId = "3";
            break;
          case Service.X_BLOC:
            colorId = "8";
            break;
          default:
            colorId = "1";
            break;
        }
      }

      const event = {
        summary: `${rdv.chirurgiens[0]?.chirurgien?.etablissement?.name} - ${rdv.chirurgiens.map((c) => `${ServiceLabels[c.chirurgien.service]} ${CiviliteLabels[c.chirurgien.civilite]} ${c.chirurgien.firstname} ${c.chirurgien?.lastname}`).join(", ")} -  ${RendezVousTypeLabels[input.rdvType]}`,
        start: {
          dateTime: input.date.toISOString(),
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: input.dateFin.toISOString(),
          timeZone: "Europe/Paris",
        },
        colorId,
      };

      try {
        const googleEvent = await createCalendarEvent(
          authClient,
          calendarId,
          event,
        );

        await ctx.db.rendezVous.update({
          where: { id: rdv.id },
          data: { googleEventId: googleEvent.id },
        });

        return { rdv, googleEvent };
      } catch (e) {
        if ((e as ErrorType).code === 404) {
          await ctx.db.user.update({
            where: { id: user.id },
            data: { googleCalendarId: null },
          });

          throw new Error("Google Calendar not found");
        }
      }
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
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const rdv = await ctx.db.rendezVous.update({
        where: {
          id: input.id,
        },
        data: {
          date: input.date,
          dateFin: input.dateFin,
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

      if (!rdv.googleEventId) {
        throw new Error("Google Calendar event ID not found");
      }

      let colorId;

      if (rdv.type === RendezVousType.ESSAI) {
        colorId = "10";
      } else {
        switch (rdv.chirurgiens[0]?.chirurgien?.service) {
          case Service.CHIR_DIGESTIF:
            colorId = "9";
            break;
          case Service.CHIR_GINECO:
            colorId = "5";
            break;
          case Service.CHIR_UROLOGIE:
            colorId = "4";
            break;
          case Service.PHARMACIE:
            colorId = "3";
            break;
          case Service.X_BLOC:
            colorId = "8";
            break;
          default:
            colorId = "1";
            break;
        }
      }

      const authClient = await getAuthClient(ctx.session.user.accessToken!);
      const event = {
        summary: `${rdv.chirurgiens[0]?.chirurgien?.etablissement?.name} - ${rdv.chirurgiens.map((c) => `${ServiceLabels[c.chirurgien.service]} ${CiviliteLabels[c.chirurgien.civilite]} ${c.chirurgien.firstname} ${c.chirurgien?.lastname}`).join(", ")} -  ${RendezVousTypeLabels[rdv.type]}`,
        start: {
          dateTime: input.date.toISOString(),
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: input.dateFin.toISOString(),
          timeZone: "Europe/Paris",
        },
        colorId: colorId,
      };

      try {
        const googleEvent = await updateCalendarEvent(
          authClient,
          user.googleCalendarId!,
          rdv.googleEventId,
          event,
        );
        return { rdv, googleEvent };
      } catch (e) {
        return { rdv };
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const chirRdv = await ctx.db.chirurgienRendezVous.delete({
        where: {
          id: input.id,
        },
      });

      const rdv = await ctx.db.rendezVous.findFirst({
        where: {
          id: chirRdv.rendezVousId,
        },
        include: {
          chirurgiens: true,
        },
      });

      if (!rdv) {
        throw new Error("Rendez-vous not found");
      }

      if (rdv.chirurgiens.length === 0) {
        await ctx.db.rendezVous.delete({
          where: {
            id: chirRdv.rendezVousId,
          },
        });

        if (!rdv.googleEventId) {
          throw new Error("Google Calendar event ID not found");
        }

        const authClient = await getAuthClient(ctx.session.user.accessToken!);

        try {
          await deleteCalendarEvent(
            authClient,
            user.googleCalendarId!,
            rdv.googleEventId,
          );
        } catch (e) {
        }
      }

      return chirRdv;
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
        chirurgienId: z.string().optional().nullable(),
        skip: z.number().default(0),
        take: z.number().default(10),
        status: z.boolean().optional().nullable(),
        me: z.boolean().optional().nullable(),
        etablissementId: z.string().optional().nullable(),
        secteurId: z.string().optional().nullable(),
        order: z.enum(["asc", "desc"]).optional().nullable(),
        search: z.string().optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // check if the user has the right to see the data

      let whereClause = {};

      if (!input.me) {
        whereClause = {
          rendezVous: {
            date: {
              // last 30 days
              gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        };
      } else {
        whereClause = {
          ...whereClause,
          rendezVous: {
            commercialId: ctx.session.user.id,
          },
        };
      }

      if (input.status !== undefined) {
        whereClause = {
          ...whereClause,
          done: input.status,
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

      if (input.secteurId) {
        whereClause = {
          ...whereClause,
          chirurgien: {
            etablissement: {
              departement: {
                secteurId: input.secteurId,
              },
            },
          },
        };
      }

      if (input.search) {
        whereClause = {
          ...whereClause,
          OR: [
            {
              chirurgien: {
                firstname: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
            },
            {
              chirurgien: {
                lastname: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
            },
            {
              chirurgien: {
                etablissement: {
                  name: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              rendezVous: {
                commercial: {
                  firstname: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              rendezVous: {
                commercial: {
                  lastname: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        };
      }

      if (input.chirurgienId) {
        whereClause = {
          ...whereClause,
          chirurgienId: input.chirurgienId,
        };
      }

      const rdvs = await ctx.db.chirurgienRendezVous.findMany({
        take: input.take,
        skip: input.skip,
        orderBy: [
          {
            rendezVous: {
              date: input.order ?? "asc",
            },
          },
        ],
        where: whereClause,
        include: {
          chirurgien: {
            include: {
              etablissement: true,
            },
          },
          rendezVous: {
            include: {
              ModelEssaiRendezVous: {
                include: {
                  model: true,
                },
              },
              commercial: true,
              nextRendezVous: {
                orderBy: {
                  date: "asc",
                },
                include: {
                  ModelEssaiRendezVous: {
                    include: {
                      model: true,
                    },
                  },
                  chirurgiens: {
                    include: {
                      chirurgien: true,
                    },
                  },
                },
              },
            },
          },
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
          rendezVous: {
            include: {
              ModelEssaiRendezVous: {
                include: {
                  model: true,
                },
              },
            },
          },
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
        modelEssai: z.array(
          z.object({
            id: z.string(),
            done: z.boolean(),
            observation: z.string().optional(),
            validation: z.boolean(),
            schedule: z.boolean().default(false),
            filePath: z.string().optional().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rdv = await ctx.db.chirurgienRendezVous.findFirst({
        where: {
          id: input.id,
        },
        include: {
          rendezVous: true,
          chirurgien: {
            include: {
              etablissement: true,
            },
          },
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

      const confirmRDV = await ctx.db.chirurgienRendezVous.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.done,
          observation: input.observation,
          rendezVous: {
            update: {
              ModelEssaiRendezVous: {
                updateMany: input.modelEssai.map((model) => ({
                  where: {
                    id: model.id,
                  },
                  data: {
                    done: model.done,
                    observation: model.observation,
                    validation: model.validation,
                    schedule: model.schedule,
                    filePath: model.filePath,
                  },
                })),
              },
            },
          },
        },
      });

      if (rdv.rendezVous.type === RendezVousType.ESSAI) {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const mailTo = process.env.MAIL_ENVOIE;

        if (!mailTo) {
          throw new Error("Mail not found");
        }

        for (const model of input.modelEssai) {
          if (model.filePath) {
            await sendMail(
              mailTo,
              "Fiche essai",
              `Bonjour,\nVeuillez trouver ci-joint la fiche d’essai du Dr. ${rdv.chirurgien.lastname} ${rdv.chirurgien.firstname}., ${rdv.chirurgien.etablissement.name} le ${format(new Date(), "dd/MM/yyyy")}.\nCordialement,\nSwing Technologies\n${user.firstname} ${user.lastname?.toUpperCase()}`,
              "",
              model.filePath,
              `/uploads/${model.filePath}`,
            ).catch(() => null);
          }
        }
      }

      return confirmRDV;
    }),
});
