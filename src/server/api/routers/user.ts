import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { paginationSchema } from "@/server/schema";

import bcrypt from "bcrypt";
import { db } from "@/server/db";
import { RoleName } from "@prisma/client";
import { formatPrenom } from "@/utils";

const saltRounds = 10; // Nombre de tours de sel, ajustez selon les besoins

async function generateUniqueUsername(
  firstname: string,
  lastname: string,
): Promise<string> {
  let tempUsername = `${firstname[0]}.${lastname}`.toLowerCase();
  let isExisting = await db.user.findUnique({
    where: { username: tempUsername },
  });

  let iterator = 1;

  // Tant qu'un utilisateur existe avec ce nom d'utilisateur, ajoutez un nombre aléatoire et vérifiez à nouveau
  while (isExisting) {
    tempUsername = `${tempUsername}${iterator}`;
    isExisting = await db.user.findUnique({
      where: { username: tempUsername },
    });

    iterator += 1;
  }

  return tempUsername;
}

const extendedPaginationSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.nativeEnum(RoleName).optional(),
});

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        email: z.string().email().optional(),
        password: z.string().min(8, {
          message: "Le mot de passe doit contenir au moins 8 caractères",
        }),
        passwordConfirm: z.string().min(8, {
          message: "Le mot de passe doit contenir au moins 8 caractères",
        }),
        roleId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if the user is an admin
      if (ctx.session.user.role.name !== RoleName.ADMIN) {
        throw new Error(
          "Vous n'avez pas l'autorisation d'ajouter un utilisateur",
        );
      }

      // check if the password and passwordConfirm match
      if (input.password !== input.passwordConfirm) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      const username = await generateUniqueUsername(
        input.firstname,
        input.lastname,
      );
      const hashedPassword = await bcrypt.hash(input.password, saltRounds);

      return ctx.db.user.create({
        data: {
          firstname: formatPrenom(input.firstname),
          lastname: input.lastname.toUpperCase(),
          username,
          email: input.email,
          password: hashedPassword,
          role: { connect: { id: input.roleId } },
        },
      });
    }),

  findOne: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role.name !== RoleName.ADMIN) {
        throw new Error(
          "Vous n'avez pas l'autorisation de voir cet utilisateur",
        );
      }

      return await ctx.db.user.findUnique({
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          role: { select: { id: true, name: true } },
        },
        where: { id: input.userId },
      });
    }),

  findMe: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        phone: true,
        email: true,
        role: { select: { id: true, name: true } },
      },
      where: { id: ctx.session.user.id },
    });
  }),

  findAll: protectedProcedure
    .input(extendedPaginationSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role.name !== RoleName.ADMIN) {
        throw new Error(
          "Vous n'avez pas l'autorisation d'ajouter un utilisateur",
        );
      }

      let whereClause = {};

      if (input.search) {
        whereClause = {
          OR: [
            { firstname: { contains: input.search, mode: "insensitive" } },
            { lastname: { contains: input.search, mode: "insensitive" } },
            { email: { contains: input.search, mode: "insensitive" } },
          ],
        };
      }

      if (input.role) {
        whereClause = {
          ...whereClause,
          role: { name: input.role },
        };
      }

      const users = await ctx.db.user.findMany({
        where: { ...whereClause },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { lastname: "asc" },
        skip: input.skip,
        take: input.take,
      });

      const total = await ctx.db.user.count();

      return { data: users, total };
    }),

  findAllCommerciaux: protectedProcedure.query(async ({ ctx }) => {
    const commerciaux = await ctx.db.user.findMany({
      where: {
        OR: [
          { role: { name: RoleName.COMMERCIAL } },
          { role: { name: RoleName.CHEF } },
          { role: { name: RoleName.ADMIN } },
        ],
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        role: { select: { name: true } },
      },
      orderBy: { lastname: "asc" },
    });

    return commerciaux;
  }),

  findCommerciauxBySecteur: protectedProcedure
    .input(z.object({ secteurId: z.string() }))
    .query(async ({ ctx, input }) => {
      const commerciaux = await ctx.db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { role: { name: RoleName.COMMERCIAL } },
                { role: { name: RoleName.CHEF } },
                { role: { name: RoleName.ADMIN } },
              ],
            },
            {
              SecteurUser: {
                some: {
                  secteurId: input.secteurId,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          role: { select: { name: true } },
        },
        orderBy: { lastname: "asc" },
      });

      return commerciaux;
    }),

  edit: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        roleId: z.string(),
        password: z
          .string()
          .min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères",
          })
          .optional(),
        passwordConfirm: z
          .string()
          .min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères",
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const requestingUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { role: true },
      });

      if (!requestingUser) {
        throw new Error("Utilisateur non trouvé");
      }

      const canEditPassword =
        requestingUser.id === input.userId ||
        ctx.session.user.role.name === RoleName.ADMIN;

      if (!canEditPassword) {
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier ce mot de passe.",
        );
      }

      if (input.password && input.passwordConfirm) {
        if (input.password !== input.passwordConfirm) {
          throw new Error("Les mots de passe ne correspondent pas");
        }

        const hashedPassword = await bcrypt.hash(input.password, saltRounds);

        return ctx.db.user.update({
          where: { id: input.userId },
          data: {
            firstname: formatPrenom(input.firstname),
            lastname: input.lastname.toUpperCase(),
            email: input.email,
            phone: input.phone,
            role: { connect: { id: input.roleId } },
            password: hashedPassword,
          },
        });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          firstname: formatPrenom(input.firstname),
          lastname: input.lastname.toUpperCase(),
          email: input.email,
          phone: input.phone,
          role: { connect: { id: input.roleId } },
        },
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(8, {
          message: "Le mot de passe doit contenir au moins 8 caractères",
        }),
        passwordConfirm: z.string().min(8, {
          message: "Le mot de passe doit contenir au moins 8 caractères",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const requestingUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { role: true },
      });

      if (!requestingUser) {
        throw new Error("Utilisateur non trouvé");
      }

      const hashedPassword = await bcrypt.hash(input.password, saltRounds);

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          password: hashedPassword,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role.name !== RoleName.ADMIN) {
        throw new Error(
          "Vous n'avez pas l'autorisation de supprimer un utilisateur",
        );
      }

      return ctx.db.user.delete({ where: { id: input.userId } });
    }),
});
