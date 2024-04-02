import bcrypt from "bcrypt";

import type { PrismaClient } from "@prisma/client";

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
  const adminPassword = await bcrypt.hash("admin1234", 10);

  const adminUser = await client.user.create({
    data: {
      firstname: "Admin",
      lastname: "Admin",
      username: "admin",
      password: adminPassword, // Utilisez un mot de passe sécurisé et hashé dans la pratique
      roleId: adminRole.id,
    },
  });

  const user1Password = await bcrypt.hash("john1234", 10);

  const user1 = await client.user.create({
    data: {
      firstname: "John",
      lastname: "Doe",
      username: "j.doe",
      password: user1Password,
      roleId: commercialRole.id,
    },
  });

  await client.user.create({
    data: {
      firstname: "Alice",
      lastname: "Doe",
      username: "a.doe",
      password: await bcrypt.hash("alice1234", 10),
      roleId: chefRole.id,
    },
  });

  // Créer plus d'utilisateurs si nécessaire...

  console.log("Users seeded");

  return { adminUser, user1 };
}

export default seedUsers;
