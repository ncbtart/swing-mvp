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
  await prisma.productAvancement.deleteMany();

  await prisma.etablissementAO.deleteMany();
  await prisma.modelEssaiRendezVous.deleteMany();
  await prisma.chirurgienRendezVous.deleteMany();
  await prisma.rendezVous.deleteMany();
  await prisma.usingSurgery.deleteMany();
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

  await seedDepartment(prisma);
  const secteurs = await seedSecteur(prisma);

  const { admin, chef, commercial } = await seedRole(prisma);
  await seedUsers(prisma, admin, chef, commercial);

  await seedReferences(prisma);
  const etablissementId = await seedEtablissement(prisma);

  await seedChirurgien(prisma, etablissementId);

  // add user to secteur
  const firstSecteur = secteurs[0];

  if (!firstSecteur) {
    throw new Error("No secteur found");
  }

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
