import { NextResponse } from "next/server";
import { jsonError, purgeExpiredSnippets, publicSnippet, readJsonBody } from "@/lib/server-api";
import { readDb } from "@/lib/server-db";
import { verifyPassword } from "@/lib/server-password";
import { isRateLimited } from "@/lib/server-rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  if (await isRateLimited(request, "share-unlock", 20, 60_000)) {
    return jsonError("Too many attempts. Try again shortly.", 429);
  }

  await purgeExpiredSnippets();
  const { id } = await context.params;
  const body = await readJsonBody(request);
  const password = typeof body.password === "string" ? body.password : "";

  const db = await readDb();
  const snippet = db.snippets.find((candidate) => candidate.id === id);
  if (!snippet) return jsonError("Snippet not found", 404);
  if (snippet.privacy !== "password") return NextResponse.json({ snippet: publicSnippet(snippet) });
  if (!verifyPassword(password, snippet.passwordHash)) return jsonError("Incorrect password", 401);

  return NextResponse.json({ snippet: publicSnippet(snippet) });
}
