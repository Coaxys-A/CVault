import { purgeExpiredSnippets } from "@/lib/server-api";
import { readDb } from "@/lib/server-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  await purgeExpiredSnippets();
  const { id } = await context.params;
  const db = await readDb();
  const snippet = db.snippets.find((s) => s.id === id);

  if (!snippet) {
    return new Response("404 Not Found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (snippet.privacy === "password") {
    return new Response("403 Forbidden: This snippet is password-protected.\n", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(snippet.code, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
