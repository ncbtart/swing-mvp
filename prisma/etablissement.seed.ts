import { EtablissementType, type PrismaClient } from "@prisma/client";

async function seedEtablissement(client: PrismaClient) {
  const dept1 = await client.departement.findFirst({
    where: {
      code: {
        startsWith: "01",
      },
    },
  });

  if (!dept1) {
    throw new Error("Cannot find departement 01");
  }

  const etablissement = await client.etablissement.create({
    data: {
      status: true,
      isClient: true,
      type: EtablissementType.CLINIQUE,
      departementId: dept1.id,
      name: "CLINIQUE CONVERT",
      adresse: "62 AVENUE JASSERON",
      central: "RAMSAY GENERALE DE SANTE",
      codePostal: "01000",
      ville: "BOURG EN BRESSE",
      telephone: "0826301234",
    },
  });

  await client.etablissement.create({
    data: {
      status: true,
      isClient: false,
      type: EtablissementType.CLINIQUE,
      departementId: dept1.id,
      name: "CLINIQUE AMBULATOIRE CENDAMEG",
      adresse: "180 ROUTE DU NANT",
      codePostal: "01280",
      ville: "PREVESSIN MOENS",
      telephone: "0450401770",
    },
  });

  await client.etablissement.create({
    data: {
      status: true,
      isClient: true,
      type: EtablissementType.CLINIQUE,
      departementId: dept1.id,
      name: "HOPITAL PRIVE D AMBERIEU SAS",
      adresse: "EN PRAGNAT NORD",
      codePostal: "01506",
      ville: "AMBERIEU EN BUGEY CEDEX",
      telephone: "0474389521",
    },
  });

  await client.etablissement.create({
    data: {
      status: true,
      isClient: false,
      type: EtablissementType.HOPITAL,
      departementId: dept1.id,
      name: "CENTRE HOSPITALIER DE BOURG EN BRESSE FLEYRIAT",
      adresse: "900 ROUTE DE PARIS",
      codePostal: "01012",
      ville: "BOURG EN BRESSE",
      telephone: "0474454647",
    },
  });

  await client.etablissement.create({
    data: {
      status: true,
      isClient: true,
      type: EtablissementType.HOPITAL,
      departementId: dept1.id,
      name: "CH DU HAUT BUGEY",
      adresse: "1 ROUTE DE VEYZIAT",
      central: "GROUPEMENT DE COMMANDES PHARMSERA",
      codePostal: "01117",
      ville: "OYONNAX",
      telephone: "0474731001",
    },
  });

  return etablissement;
}

export default seedEtablissement;
