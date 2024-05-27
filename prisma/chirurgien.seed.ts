import { Civilite, Fonction, Service, type PrismaClient } from "@prisma/client";

async function seedChirurgien(client: PrismaClient, etablissementId: string) {
  await client.chirurgien.create({
    data: {
      lastname: "DUPONT",
      firstname: "Jean",
      phone: "0123456789",
      fonction: Fonction.CHIR,
      email: "j.dupon@localhost",
      etablissementId: etablissementId,
      adresse: "1 rue de la paix",
      civilite: Civilite.M,
      joursBloc: ["LUNDI", "MARDI"],
      joursConsult: ["MERCREDI", "JEUDI"],
      service: Service.CHIR_DIGESTIF,
      isDiffusion: false,
    },
  });

  await client.chirurgien.create({
    data: {
      lastname: "DUVAL",
      firstname: "Jeanne",
      phone: "0123456790",
      fonction: Fonction.CHIR,
      email: "j.duval@localhost",
      etablissementId: etablissementId,
      adresse: "1 rue de la paix",
      civilite: Civilite.MME,
      joursBloc: ["LUNDI", "MARDI"],
      joursConsult: ["MERCREDI", "JEUDI"],
      service: Service.CHIR_DIGESTIF,
      isDiffusion: false,
    },
  });

  await client.chirurgien.create({
    data: {
      lastname: "MARTIN",
      firstname: "Jacques",
      adresse: "1 rue de la paix",
      fonction: Fonction.CHIR,
      etablissementId: etablissementId,
      phone: "0223456789",
      email: "j.martin@localhost",
      civilite: Civilite.M,
      joursBloc: ["MERCREDI", "JEUDI"],
      joursConsult: ["LUNDI", "VENDREDI"],
      service: Service.CHIR_UROLOGIE,
      isDiffusion: false,
    },
  });
}

export default seedChirurgien;
