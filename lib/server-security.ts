import "server-only";

import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { readDb } from "@/lib/server-db";
import { getRedis } from "@/lib/server-redis";
import { User } from "@/lib/types";

const SESSION_COOKIE = "cvault_session";
const CAPTCHA_COOKIE = "cvault_captcha";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const CAPTCHA_MAX_AGE = 60 * 10;
const APP_SECRET = process.env.CVAULT_SECRET ?? "cvault-local-dev-secret";
const SECURE_COOKIES = process.env.CVAULT_SECURE_COOKIES === "true";

const memorySessions = new Map<string, { userId: string; expiresAt: number }>();
const memoryCaptchas = new Map<string, { answer: string; expiresAt: number }>();

function sign(value: string): string {
  return createHmac("sha256", APP_SECRET).update(value).digest("hex");
}

function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function createSession(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = randomUUID();
  const value = sessionId;
  const token = `${value}:${sign(value)}`;
  const redis = await getRedis();

  if (redis) {
    await redis.set(`cvault:session:${sessionId}`, userId, { EX: SESSION_MAX_AGE });
  } else {
    memorySessions.set(sessionId, {
      userId,
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    });
  }

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIES,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionId = parseSignedToken(token);
  const redis = await getRedis();

  if (sessionId && redis) {
    await redis.del(`cvault:session:${sessionId}`);
  } else if (sessionId) {
    memorySessions.delete(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function createCaptchaChallenge(): Promise<string> {
  const left = randomInt(2, 13);
  const right = randomInt(2, 13);
  const operator = randomInt(0, 2) === 0 ? "+" : "-";
  const answer = operator === "+" ? left + right : left - right;
  const nonce = randomUUID();
  const value = nonce;
  const cookieStore = await cookies();
  const redis = await getRedis();

  if (redis) {
    await redis.set(`cvault:captcha:${nonce}`, String(answer), { EX: CAPTCHA_MAX_AGE });
  } else {
    memoryCaptchas.set(nonce, {
      answer: String(answer),
      expiresAt: Date.now() + CAPTCHA_MAX_AGE * 1000,
    });
  }

  cookieStore.set(CAPTCHA_COOKIE, `${nonce}:${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIES,
    path: "/",
    maxAge: CAPTCHA_MAX_AGE,
  });

  return `${left} ${operator} ${right}`;
}

export async function verifyCaptcha(answer: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CAPTCHA_COOKIE)?.value;
  cookieStore.delete(CAPTCHA_COOKIE);
  const nonce = parseSignedToken(token);
  if (!nonce) return false;

  const redis = await getRedis();
  let expected: string | null | undefined;

  if (redis) {
    const key = `cvault:captcha:${nonce}`;
    expected = await redis.get(key);
    if (expected) await redis.del(key);
  } else {
    const stored = memoryCaptchas.get(nonce);
    memoryCaptchas.delete(nonce);
    expected = stored && stored.expiresAt > Date.now() ? stored.answer : null;
  }

  return expected === answer.trim();
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionId = parseSignedToken(token);
  if (!sessionId) return null;

  const redis = await getRedis();
  let userId: string | null | undefined;

  if (redis) {
    userId = await redis.get(`cvault:session:${sessionId}`);
  } else {
    const session = memorySessions.get(sessionId);
    if (session && session.expiresAt <= Date.now()) memorySessions.delete(sessionId);
    userId = session && session.expiresAt > Date.now() ? session.userId : null;
  }

  if (!userId) return null;

  const db = await readDb();
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function parseSignedToken(token?: string): string | null {
  const parts = token?.split(":") ?? [];
  if (parts.length !== 2) return null;

  const [value, signature] = parts;
  if (!value || !signature) return null;
  if (!safeCompare(signature, sign(value))) return null;
  return value;
}
