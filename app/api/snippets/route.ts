import { NextResponse } from "next/server";
import { createStoredSnippet, jsonError, purgeExpiredSnippets, publicSnippet, readJsonBody } from "@/lib/server-api";
import { getCurrentUser } from "@/lib/server-security";
import { readDb, writeDb } from "@/lib/server-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Authentication required", 401);

  await purgeExpiredSnippets();
  const db = await readDb();
  const snippets = db.snippets
    .filter((snippet) => snippet.ownerId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(publicSnippet);

  return NextResponse.json({ snippets });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Authentication required", 401);

  const snippet = await createStoredSnippet(user.id, await readJsonBody(request));
  if ("error" in snippet) return jsonError(snippet.error, 400);

  await writeDb((db) => {
    db.snippets.unshift(snippet);
  });

  return NextResponse.json({ snippet: publicSnippet(snippet) }, { status: 201 });
}
