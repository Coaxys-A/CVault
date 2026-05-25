import "server-only";

import { existsSync } from "fs";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { Expiration, Snippet, User } from "@/lib/types";

export interface StoredUser extends User {
  passwordHash: string;
}

export interface StoredSnippet extends Snippet {
  ownerId: string;
  passwordHash?: string;
}

interface Database {
  users: StoredUser[];
  snippets: StoredSnippet[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let writeQueue = Promise.resolve();

function calculateExpiresAt(expiration: Expiration, from = new Date()): string | null {
  if (expiration === "never") return null;

  const expiresAt = new Date(from);
  if (expiration === "1h") expiresAt.setHours(expiresAt.getHours() + 1);
  if (expiration === "1d") expiresAt.setDate(expiresAt.getDate() + 1);
  if (expiration === "1w") expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt.toISOString();
}

async function seedDatabase(): Promise<Database> {
  return {
    users: [],
    snippets: [],
  };
}

async function ensureDatabase(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  if (existsSync(DB_FILE)) return;

  const seeded = await seedDatabase();
  await writeFile(DB_FILE, JSON.stringify(seeded, null, 2));
}

export async function readDb(): Promise<Database> {
  await ensureDatabase();
  const raw = await readFile(DB_FILE, "utf8");
  const db = JSON.parse(raw) as Database;
  db.users ??= [];
  db.snippets ??= [];
  return db;
}

export async function writeDb(updater: (db: Database) => Database | void | Promise<Database | void>) {
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    const next = (await updater(db)) ?? db;
    const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
    await writeFile(tmpFile, JSON.stringify(next, null, 2));
    await rename(tmpFile, DB_FILE);
  });

  return writeQueue;
}

export function isExpired(snippet: StoredSnippet): boolean {
  return Boolean(snippet.expiresAt && new Date(snippet.expiresAt).getTime() <= Date.now());
}

export function publicSnippet(snippet: StoredSnippet): Snippet {
  return {
    id: snippet.id,
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
    privacy: snippet.privacy,
    expiration: snippet.expiration,
    expiresAt: snippet.expiresAt,
    tags: snippet.tags,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
  };
}

export function createSnippetId(): string {
  return randomUUID().replaceAll("-", "").slice(0, 12);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

export { calculateExpiresAt };
