import assert from "node:assert/strict";
import test from "node:test";

import { paginationSchema } from "./schema";

void test("paginationSchema accepts valid pagination values", () => {
  const parsed = paginationSchema.parse({
    skip: 10,
    take: 25,
  });

  assert.deepEqual(parsed, { skip: 10, take: 25 });
});

void test("paginationSchema accepts empty input", () => {
  const parsed = paginationSchema.parse({});
  assert.deepEqual(parsed, {});
});

void test("paginationSchema rejects negative skip", () => {
  assert.throws(() => paginationSchema.parse({ skip: -1 }), {
    name: "ZodError",
  });
});

void test("paginationSchema rejects take greater than 100", () => {
  assert.throws(() => paginationSchema.parse({ take: 101 }), {
    name: "ZodError",
  });
});
