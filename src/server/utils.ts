import bcrypt from "bcrypt";

// Exclude keys from user
export function exclude<T, Key extends keyof T>(
  value: T,
  keys: Key[],
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([key]) => !keys.includes(key as Key),
    ),
  ) as Omit<T, Key>;
}

export async function validatePassword(password: string, credentials: string) {
  return await bcrypt.compare(password, credentials);
}
