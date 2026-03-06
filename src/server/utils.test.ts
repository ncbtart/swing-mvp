import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";

import { exclude, validatePassword } from "./utils";

void test("exclude removes provided keys and keeps the rest", () => {
  const user = {
    id: "u1",
    username: "alice",
    password: "secret",
    role: "ADMIN",
  };

  const sanitized = exclude(user, ["password"]);

  assert.equal(sanitized.id, "u1");
  assert.equal(sanitized.username, "alice");
  assert.equal(sanitized.role, "ADMIN");
  assert.equal("password" in sanitized, false);
});

void test("validatePassword returns true for a matching password", async () => {
  const plainPassword = "MyS3cretPwd!";
  const hash = await bcrypt.hash(plainPassword, 10);

  const isValid = await validatePassword(plainPassword, hash);

  assert.equal(isValid, true);
});

void test("validatePassword returns false for a non matching password", async () => {
  const plainPassword = "MyS3cretPwd!";
  const hash = await bcrypt.hash(plainPassword, 10);

  const isValid = await validatePassword("wrong-password", hash);

  assert.equal(isValid, false);
});
