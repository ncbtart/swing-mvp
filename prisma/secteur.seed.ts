import { type PrismaClient } from "@prisma/client";

const secteurs = [
  {
    name: "BOURGOGNE A12",
    departements: [
      { code: "01" },
      { code: "10" },
      { code: "21" },
      { code: "25" },
      { code: "39" },
      { code: "51" },
      { code: "52" },
      { code: "58" },
      { code: "70" },
      { code: "71" },
      { code: "89" },
      { code: "90" },
    ],
  },
  {
    name: "BRETAGNE A1",
    departements: [
      { code: "22" },
      { code: "29" },
      { code: "35" },
      { code: "56" },
    ],
  },
  {
    name: "CENTRE B10",
    departements: [
      { code: "03" },
      { code: "18" },
      { code: "19" },
      { code: "23" },
      { code: "36" },
      { code: "41" },
      { code: "42" },
      { code: "43" },
      { code: "58" },
      { code: "63" },
      { code: "87" },
    ],
  },
  {
    name: "EST A4",
    departements: [
      { code: "54" },
      { code: "55" },
      { code: "57" },
      { code: "67" },
      { code: "68" },
      { code: "88" },
    ],
  },
  {
    name: "LOIRE A11",
    departements: [
      { code: "16" },
      { code: "17" },
      { code: "37" },
      { code: "44" },
      { code: "49" },
      { code: "79" },
      { code: "85" },
      { code: "86" },
    ],
  },
  {
    name: "NORD A3",
    departements: [
      { code: "02" },
      { code: "08" },
      { code: "59" },
      { code: "60" },
      { code: "62" },
      { code: "80" },
    ],
  },
  {
    name: "NORMANDIE A2",
    departements: [
      { code: "14" },
      { code: "27" },
      { code: "28" },
      { code: "50" },
      { code: "53" },
      { code: "61" },
      { code: "72" },
      { code: "76" },
    ],
  },
  {
    name: "PACA AG5",
    departements: [
      { code: "04" },
      { code: "05" },
      { code: "06" },
      { code: "13" },
      { code: "83" },
      { code: "84" },
      { code: "2A" },
      { code: "2B" },
      { code: "M1" },
    ],
  },
  {
    name: "PARIS-E-AG5",
    departements: [
      { code: "45" },
      { code: "77" },
      { code: "89" },
      { code: "91" },
      { code: "93" },
      { code: "94" },
    ],
  },
  {
    name: "PARIS-O-AG5",
    departements: [
      { code: "75" },
      { code: "78" },
      { code: "92" },
      { code: "95" },
    ],
  },
  {
    name: "RHONE ALPES B9",
    departements: [
      { code: "07" },
      { code: "26" },
      { code: "38" },
      { code: "69" },
      { code: "73" },
      { code: "74" },
    ],
  },
  {
    name: "SUD B7",
    departements: [
      { code: "09" },
      { code: "11" },
      { code: "12" },
      { code: "15" },
      { code: "30" },
      { code: "34" },
      { code: "46" },
      { code: "48" },
      { code: "65" },
      { code: "66" },
      { code: "81" },
      { code: "82" },
    ],
  },
  {
    name: "SUD OUEST VRP B6",
    departements: [
      { code: "24" },
      { code: "31" },
      { code: "32" },
      { code: "33" },
      { code: "40" },
      { code: "47" },
      { code: "64" },
      { code: "65" },
    ],
  },
];

const seedSecteur = async (client: PrismaClient) => {
  const secteursCreateds = await Promise.all(
    secteurs.map(async (secteur) => {
      const secteurCreated = await client.secteur.create({
        data: {
          name: secteur.name,
        },
      });

      await Promise.all(
        secteur.departements.map(async (departement) => {
          await client.departement.updateMany({
            where: {
              code: departement.code,
            },
            data: {
              secteurId: secteurCreated.id,
            },
          });
        }),
      );

      return secteurCreated;
    }),
  );

  return secteursCreateds;
};

export default seedSecteur;
