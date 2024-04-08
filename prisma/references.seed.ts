import {
  type Surgery,
  type Fabricant,
  type PrismaClient,
} from "@prisma/client";

import Refeerences from "../assets/references.json";

async function seedReferences(client: PrismaClient) {
  const references = Refeerences.map(async (reference) => {
    return client.product
      .create({
        data: {
          fabricant: reference.fabricant as Fabricant,
          reference: reference.name,
          surgery: reference.surgery as Surgery[],
          models: {
            create: (reference.models ?? []).map((model) => ({
              name: model.name,
            })),
          },
        },
      })
      .catch((e) => {
        console.error("Error seeding reference " + reference.name);
        console.error(e);
      });
  });

  return Promise.all(references);
}

export default seedReferences;
