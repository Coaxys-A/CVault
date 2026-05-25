import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/server-password";
import { createSession, verifyCaptcha } from "@/lib/server-security";
import { normalizeUsername, writeDb } from "@/lib/server-db";
import { jsonError, readJsonBody } from "@/lib/server-api";
import { isRateLimited } from "@/lib/server-rate-limit";

export async function POST(request: Request) {
  if (await isRateLimited(request, "register", 5, 60_000)) {
    return jsonError("Too many attempts. Try again shortly.", 429);
  }

  const body = await readJsonBody(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const captcha = typeof body.captcha === "string" ? body.captcha : "";

  if (!name) return jsonError("Name is required", 400);
  if (username.length < 3) return jsonError("Username must be at least 3 characters", 400);
  if (password.length < 8) return jsonError("Password must be at least 8 characters", 400);
  if (!(await verifyCaptcha(captcha))) return jsonError("Captcha answer is incorrect", 400);

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    username,
    name,
    passwordHash: hashPassword(password),
    createdAt: now,
  };

  let duplicate = false;
  await writeDb((db) => {
    duplicate = db.users.some((candidate) => candidate.username === username);
    if (!duplicate) db.users.push(user);
  });

  if (duplicate) return jsonError("That username is already taken", 409);

  await createSession(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
    },
  }, { status: 201 });
}
