import { NextResponse } from "next/server";
import { createCaptchaChallenge } from "@/lib/server-security";
import { jsonError } from "@/lib/server-api";
import { isRateLimited } from "@/lib/server-rate-limit";

export async function GET(request: Request) {
  if (await isRateLimited(request, "captcha", 60, 60_000)) {
    return jsonError("Too many captcha requests. Try again shortly.", 429);
  }

  const challenge = await createCaptchaChallenge();
  return NextResponse.json({ challenge });
}
