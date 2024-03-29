import { type PrismaClient } from "@prisma/client";

import Department from "../assets/departements-region.json";

async function seedDepartment(client: PrismaClient) {
  await client.departement.create({
    data: {
      name: "Monaco",
      code: "M1",
    },
  });

  const departments = Department.map(async (department) => {
    return client.departement.create({
      data: {
        name: department.dep_name,
        code: department.num_dep.toString(),
      },
    });
  });

  return Promise.all(departments);
}

export default seedDepartment;
