import { PrismaClient } from "@prisma/client";
import seedRole from "./role.seed";
import seedUsers from "./user.seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  await prisma.role.deleteMany();

  const { admin, chef, commercial } = await seedRole(prisma);
  await seedUsers(prisma, admin, chef, commercial);

  console.log("Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(function () {
    prisma.$disconnect().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  });
