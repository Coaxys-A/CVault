"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { SnippetCard } from "@/components/snippet-card";
import { api } from "@/lib/api-client";
import { Snippet } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    api.listSnippets()
      .then(({ snippets }) => setSnippets(snippets.slice(0, 3)))
      .catch(() => setSnippets([]));
  }, []);

  return (
    <div>
      <Hero />

      {snippets.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent snippets</h2>
            <Link href="/snippets">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {snippets.map((snippet, i) => (
              <SnippetCard key={snippet.id} snippet={snippet} view="grid" index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
