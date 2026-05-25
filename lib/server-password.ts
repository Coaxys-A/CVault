import "server-only";

import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const HASH_ITERATIONS = 210_000;
const HASH_KEY_LENGTH = 32;
const HASH_DIGEST = "sha256";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString("hex");
  return `${HASH_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;

  const [iterationsValue, salt, hash] = storedHash.split(":");
  const iterations = Number(iterationsValue);
  if (!iterations || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, HASH_DIGEST);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
