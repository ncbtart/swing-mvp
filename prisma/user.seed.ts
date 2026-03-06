import bcrypt from "bcrypt";

import type { PrismaClient } from "@prisma/client";

import Commerciaux from "../assets/commerciaux.json";

interface Role {
  id: string;
  name: string;
}

async function seedUsers(
  client: PrismaClient,
  adminRole: Role,
  chefRole: Role,
  commercialRole: Role,
) {
  for (const commercial of Commerciaux) {
    const { firstname, lastname, secteur, email } = commercial;

    const newEmail =
      email ?? `${firstname.toLowerCase()}.${lastname.toLowerCase()}@localhost`;
    const hashedPassword = await bcrypt.hash(`azertyuiop1234`, 10);

    const secteurs = await client.secteur.findMany({
      where: {
        name: {
          in: secteur.map((s) => s.name),
        },
      },
    });

    const user = await client.user.create({
      data: {
        username: `${firstname.toLowerCase()[0]}.${lastname.toLowerCase()}`,
        email: newEmail,
        firstname,
        lastname: lastname.toUpperCase(),
        roleId: commercialRole.id,
        password: hashedPassword,
        SecteurUser: {
          createMany: {
            data: secteurs.map((s) => ({
              secteurId: s.id,
            })),
          },
        },
      },
    });

    console.log(`Commercial ${user.firstname} ${user.lastname} créé`);
  }

  await client.user.create({
    data: {
      username: "admin",
      email: "admin@localhost",
      firstname: "Admin",
      lastname: "Admin",
      roleId: adminRole.id,
      password: await bcrypt.hash("admin", 10),
    },
  });
}

export default seedUsers;
