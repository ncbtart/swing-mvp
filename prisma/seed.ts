import { PrismaClient } from "@prisma/client";
import seedRole from "./role.seed";
import seedUsers from "./user.seed";
import seedDepartment from "./departement.seed";
import seedSecteur from "./secteur.seed";
import seedReferences from "./references.seed";
import seedEtablissement from "./etablissement.seed";
import seedChirurgien from "./chirurgien.seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.referenceChir.deleteMany();

  await prisma.usingSurgery.deleteMany();

  await prisma.chirurgien.deleteMany();

  await prisma.model.deleteMany();
  await prisma.product.deleteMany();

  await prisma.etablissement.deleteMany();

  await prisma.secteurUser.deleteMany();
  await prisma.secteur.deleteMany();
  await prisma.departement.deleteMany();

  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const { admin, chef, commercial } = await seedRole(prisma);
  const { user1 } = await seedUsers(prisma, admin, chef, commercial);
  await seedDepartment(prisma);
  const secteurs = await seedSecteur(prisma);

  await seedReferences(prisma);
  const etablissement = await seedEtablissement(prisma);

  await seedChirurgien(prisma, etablissement.id);

  // add user to secteur
  const firstSecteur = secteurs[0];

  if (!firstSecteur) {
    throw new Error("No secteur found");
  }

  await prisma.secteurUser.create({
    data: {
      userId: user1.id,
      secteurId: firstSecteur.id,
    },
  });

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
