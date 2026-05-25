import { NextResponse } from "next/server";
import { normalizeUsername, readDb } from "@/lib/server-db";
import { verifyPassword } from "@/lib/server-password";
import { createSession, verifyCaptcha } from "@/lib/server-security";
import { jsonError, readJsonBody } from "@/lib/server-api";
import { isRateLimited } from "@/lib/server-rate-limit";

export async function POST(request: Request) {
  if (await isRateLimited(request, "login", 12, 60_000)) {
    return jsonError("Too many attempts. Try again shortly.", 429);
  }

  const body = await readJsonBody(request);
  const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const captcha = typeof body.captcha === "string" ? body.captcha : "";

  if (!username || !password) return jsonError("Username and password are required", 400);
  if (!(await verifyCaptcha(captcha))) return jsonError("Captcha answer is incorrect", 400);

  const db = await readDb();
  const user = db.users.find((candidate) => candidate.username === username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return jsonError("Invalid username or password", 401);
  }

  await createSession(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
}
