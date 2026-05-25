"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SnippetCard } from "@/components/snippet-card";
import { SearchBar } from "@/components/search-bar";
import { ViewToggle } from "@/components/view-toggle";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { Snippet } from "@/lib/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function SnippetsPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    api.listSnippets()
      .then(({ snippets }) => {
        setSnippets(snippets);
        setAuthRequired(false);
      })
      .catch(() => {
        setAuthRequired(true);
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    if (!search.trim()) return snippets;
    const q = search.toLowerCase();
    return snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.code.toLowerCase().includes(q)
    );
  }, [snippets, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Snippets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href={authRequired ? "/login" : "/snippets/new"}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New snippet
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : authRequired ? (
        <EmptyState
          title="Sign in required"
          description="Create an account or sign in to manage your private snippets."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results" : "No snippets yet"}
          description={
            search
              ? "Try a different search term."
              : "Create your first snippet to get started."
          }
        />
      ) : (
        <LayoutGroup>
          <motion.div
            className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((snippet, i) => (
              <SnippetCard key={snippet.id} snippet={snippet} view={view} index={i} />
            ))}
          </motion.div>
        </LayoutGroup>
      )}
    </div>
  );
}
