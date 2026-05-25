import { NextResponse } from "next/server";
import { jsonError, purgeExpiredSnippets, publicSnippet } from "@/lib/server-api";
import { readDb } from "@/lib/server-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  await purgeExpiredSnippets();
  const { id } = await context.params;
  const db = await readDb();
  const snippet = db.snippets.find((candidate) => candidate.id === id);
  if (!snippet) return jsonError("Snippet not found", 404);

  if (snippet.privacy === "password") {
    return NextResponse.json({
      locked: true,
      snippet: {
        ...publicSnippet(snippet),
        code: "",
      },
    });
  }

  return NextResponse.json({ locked: false, snippet: publicSnippet(snippet) });
}
