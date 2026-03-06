import assert from "node:assert/strict";
import test from "node:test";
import { Fabricant, RoleName, Surgery } from "@prisma/client";

import { createCallerFactory } from "@/server/api/trpc";
import { referenceRouter } from "./reference";

const createReferenceCaller = createCallerFactory(referenceRouter);

void test("reference.findAll returns data and total with default filters", async () => {
  let findManyArgs: unknown;
  let countArgs: unknown;

  const expectedData = [
    { id: "p1", reference: "REF-001", models: [] },
    { id: "p2", reference: "REF-002", models: [] },
  ];

  const caller = createReferenceCaller({
    db: {
      product: {
        findMany: async (args: unknown) => {
          findManyArgs = args;
          return expectedData;
        },
        count: async (args: unknown) => {
          countArgs = args;
          return 2;
        },
      },
    } as never,
    session: {
      user: {
        id: "u-admin",
        role: { name: RoleName.ADMIN },
      },
    } as never,
    headers: new Headers(),
  });

  const result = await caller.findAll({ skip: 0, take: 20 });

  assert.deepEqual(result, { data: expectedData, total: 2 });
  assert.deepEqual(findManyArgs, {
    where: {},
    take: 20,
    skip: 0,
    orderBy: { reference: "asc" },
    include: { models: true },
  });
  assert.deepEqual(countArgs, { where: {} });
});

void test("reference.findAll builds where clause for search, fabricant and surgery", async () => {
  let findManyArgs: unknown;
  let countArgs: unknown;

  const caller = createReferenceCaller({
    db: {
      product: {
        findMany: async (args: unknown) => {
          findManyArgs = args;
          return [];
        },
        count: async (args: unknown) => {
          countArgs = args;
          return 0;
        },
      },
    } as never,
    session: {
      user: {
        id: "u-admin",
        role: { name: RoleName.ADMIN },
      },
    } as never,
    headers: new Headers(),
  });

  await caller.findAll({
    skip: 10,
    take: 10,
    search: "swing",
    fabricant: Fabricant.SWING,
    surgery: Surgery.HIC,
  });

  const expectedWhere = {
    OR: [{ reference: { contains: "swing", mode: "insensitive" } }],
    fabricant: Fabricant.SWING,
    surgery: { has: Surgery.HIC },
  };

  assert.deepEqual(findManyArgs, {
    where: expectedWhere,
    take: 10,
    skip: 10,
    orderBy: { reference: "asc" },
    include: { models: true },
  });
  assert.deepEqual(countArgs, { where: expectedWhere });
});
