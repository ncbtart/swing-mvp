import assert from "node:assert/strict";
import test from "node:test";
import { RoleName } from "@prisma/client";

import { createCallerFactory } from "@/server/api/trpc";
import { roleRouter } from "./role";

const createRoleCaller = createCallerFactory(roleRouter);

void test("role.findAll returns roles ordered by name asc", async () => {
  let findManyArgs: unknown;
  const expected = [
    { id: "r1", name: RoleName.ADMIN },
    { id: "r2", name: RoleName.CHEF },
  ];

  const caller = createRoleCaller({
    db: {
      role: {
        findMany: async (args: unknown) => {
          findManyArgs = args;
          return expected;
        },
      },
    } as never,
    session: {
      user: {
        id: "u1",
      },
    } as never,
    headers: new Headers(),
  });

  const result = await caller.findAll();

  assert.deepEqual(result, expected);
  assert.deepEqual(findManyArgs, { orderBy: { name: "asc" } });
});
