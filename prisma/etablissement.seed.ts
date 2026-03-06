import { type EtablissementType, type PrismaClient } from "@prisma/client";

import XLSX from "xlsx";

type ExcelData = Record<string, string>;

let etablissementId: string;

async function seedEtablissement(client: PrismaClient) {
  const workbook = XLSX.readFile("assets/FICHIER_CLIENT.xlsx");
  const sheetName = workbook.SheetNames[0]; // prend la première feuille

  if (!sheetName) {
    throw new Error("Cannot find sheet name");
  }

  const sheet = workbook.Sheets[sheetName]!;

  const headers: string[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: "A2:Z2",
  })[0] as string[];

  const data: ExcelData[] = XLSX.utils
    .sheet_to_json<ExcelData>(sheet, {
      header: headers,
      range: "A4:Z800", // Assure-toi d'ajuster le range selon le contenu et la taille de ton fichier
      raw: true,
    })
    .map((row) => ({
      ...row,
      codePostal: row["Code Postal"]?.toString() ?? "", // Convertit explicitement en chaîne de caractères et utilise une chaîne vide comme valeur par défaut
      telEtbs: row["Tél Etbs"]?.toString().replace(/\s+/g, "") ?? "", // Convertit explicitement en chaîne de caractères et utilise une chaîne vide comme valeur par défaut
    }));

  for (const row of data) {
    try {
      const departement = await client.departement.findFirst({
        where: {
          code: {
            startsWith: (row.codePostal ?? "").toString().slice(0, 2),
          },
        },
      });

      if (!departement) {
        throw new Error(
          `Impossible de trouver le département pour le code postal ${row.codePostal}`,
        );
      }

      await client.etablissement
        .create({
          data: {
            status: row.Statut === "ACTIF",
            isClient: row.Client === "OUI",
            type: row.TYPE as EtablissementType,
            departementId: departement.id,
            name: row["RAISON SOCIALE"]!,
            adresse: row["ADRESSE SITE"]!,
            central: row.CENTRALE!,
            codePostal: row.codePostal!,
            ville: row.VILLE!,
            telephone: row.telEtbs!,
          },
        })
        .then((etablissement) => {
          if (!etablissementId) {
            etablissementId = etablissement.id;
          }
        });

      console.log(`Etablissement ${row["RAISON SOCIALE"]} créé`);
    } catch (e) {
      console.error(
        `Impossible de créer l'établissement ${row["RAISON SOCIALE"]}`,
      );
      console.error(e);
    }
  }

  return etablissementId;
}

export default seedEtablissement;
