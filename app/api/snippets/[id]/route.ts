import { NextResponse } from "next/server";
import { applySnippetUpdate, jsonError, purgeExpiredSnippets, publicSnippet, readJsonBody } from "@/lib/server-api";
import { getCurrentUser } from "@/lib/server-security";
import { readDb, writeDb } from "@/lib/server-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Authentication required", 401);

  await purgeExpiredSnippets();
  const { id } = await context.params;
  const db = await readDb();
  const snippet = db.snippets.find((candidate) => candidate.id === id && candidate.ownerId === user.id);
  if (!snippet) return jsonError("Snippet not found", 404);

  return NextResponse.json({ snippet: publicSnippet(snippet) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Authentication required", 401);

  const { id } = await context.params;
  const body = await readJsonBody(request);
  let updatedSnippet = null as ReturnType<typeof publicSnippet> | null;
  let error: string | null = null;

  await writeDb(async (db) => {
    const index = db.snippets.findIndex((candidate) => candidate.id === id && candidate.ownerId === user.id);
    if (index < 0) {
      error = "Snippet not found";
      return;
    }

    const next = await applySnippetUpdate(db.snippets[index], body);
    if ("error" in next) {
      error = next.error;
      return;
    }

    db.snippets[index] = next;
    updatedSnippet = publicSnippet(next);
  });

  if (error) return jsonError(error, error === "Snippet not found" ? 404 : 400);
  return NextResponse.json({ snippet: updatedSnippet });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Authentication required", 401);

  const { id } = await context.params;
  let deleted = false;

  await writeDb((db) => {
    const before = db.snippets.length;
    db.snippets = db.snippets.filter((snippet) => !(snippet.id === id && snippet.ownerId === user.id));
    deleted = db.snippets.length !== before;
  });

  if (!deleted) return jsonError("Snippet not found", 404);
  return new Response(null, { status: 204 });
}
