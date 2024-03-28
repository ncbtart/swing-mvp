import { RoleName, type PrismaClient } from "@prisma/client";

async function seedRole(client: PrismaClient) {
  const admin = await client.role.create({
    data: {
      name: RoleName.ADMIN,
    },
  });

  const chef = await client.role.create({
    data: {
      name: RoleName.CHEF,
    },
  });

  const commercial = await client.role.create({
    data: {
      name: RoleName.COMMERCIAL,
    },
  });

  return { admin, chef, commercial };
}

export default seedRole;
