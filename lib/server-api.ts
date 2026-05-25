import "server-only";

import { NextResponse } from "next/server";
import { calculateExpiresAt, createSnippetId, isExpired, publicSnippet, readDb, StoredSnippet, writeDb } from "@/lib/server-db";
import { hashPassword } from "@/lib/server-password";
import { Expiration, LANGUAGES, PrivacyType } from "@/lib/types";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface ValidSnippetPayload {
  title: string;
  code: string;
  language: string;
  privacy: PrivacyType;
  expiration: Expiration;
  tags: string[];
  password?: string;
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function isPrivacy(value: unknown): value is PrivacyType {
  return value === "secret" || value === "password";
}

function isExpiration(value: unknown): value is Expiration {
  return value === "never" || value === "1h" || value === "1d" || value === "1w";
}

export function validateSnippetPayload(body: Record<string, unknown>, options: { requirePassword: boolean }): { value: ValidSnippetPayload } | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const code = typeof body.code === "string" ? body.code : "";
  const language = typeof body.language === "string" ? body.language : "";
  const privacy = body.privacy;
  const expiration = body.expiration;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
    : [];
  const password = typeof body.password === "string" ? body.password : "";

  if (!title) return { error: "Title is required" as const };
  if (!code.trim()) return { error: "Content is required" as const };
  if (!LANGUAGES.includes(language as (typeof LANGUAGES)[number])) return { error: "Unsupported language" as const };
  if (!isPrivacy(privacy)) return { error: "Invalid privacy setting" as const };
  if (!isExpiration(expiration)) return { error: "Invalid expiration setting" as const };
  if (options.requirePassword && privacy === "password" && !password.trim()) return { error: "Password is required" as const };

  return {
    value: {
      title,
      code,
      language,
      privacy,
      expiration,
      tags: [...new Set(tags)].slice(0, 12),
      password: password.trim() || undefined,
    },
  };
}

export async function purgeExpiredSnippets(): Promise<void> {
  const db = await readDb();
  if (!db.snippets.some(isExpired)) return;

  await writeDb((current) => {
    current.snippets = current.snippets.filter((snippet) => !isExpired(snippet));
  });
}

export async function createStoredSnippet(ownerId: string, body: Record<string, unknown>): Promise<StoredSnippet | { error: string }> {
  const parsed = validateSnippetPayload(body, { requirePassword: true });
  if (!("value" in parsed)) return parsed;
  if (parsed.value.privacy === "password" && !parsed.value.password) {
    return { error: "Password is required" };
  }

  const now = new Date();
  const passwordHash =
    parsed.value.privacy === "password" && parsed.value.password
      ? hashPassword(parsed.value.password)
      : undefined;

  return {
    id: createSnippetId(),
    ownerId,
    title: parsed.value.title,
    code: parsed.value.code,
    language: parsed.value.language,
    privacy: parsed.value.privacy,
    passwordHash,
    expiration: parsed.value.expiration,
    expiresAt: calculateExpiresAt(parsed.value.expiration, now),
    tags: parsed.value.tags,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export async function applySnippetUpdate(existing: StoredSnippet, body: Record<string, unknown>): Promise<StoredSnippet | { error: string }> {
  const parsed = validateSnippetPayload(body, { requirePassword: false });
  if (!("value" in parsed)) return parsed;

  const nextPasswordHash =
    parsed.value.privacy === "password"
      ? parsed.value.password
        ? hashPassword(parsed.value.password)
        : existing.passwordHash
      : undefined;

  if (parsed.value.privacy === "password" && !nextPasswordHash) {
    return { error: "Password is required" };
  }

  return {
    ...existing,
    title: parsed.value.title,
    code: parsed.value.code,
    language: parsed.value.language,
    privacy: parsed.value.privacy,
    passwordHash: nextPasswordHash,
    expiration: parsed.value.expiration,
    expiresAt: calculateExpiresAt(parsed.value.expiration),
    tags: parsed.value.tags,
    updatedAt: new Date().toISOString(),
  };
}

export { publicSnippet };
