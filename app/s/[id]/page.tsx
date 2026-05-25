"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Link as LinkIcon, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/code-viewer";
import { PasswordGate } from "@/components/password-gate";
import { api } from "@/lib/api-client";
import { Snippet } from "@/lib/types";
import { formatExpiry } from "@/lib/expiry-format";
import { cn } from "@/lib/utils";

export default function SharedSnippetPage() {
  const params = useParams();
  const id = params.id as string;
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSharedSnippet(id)
      .then(({ snippet, locked }) => {
        setSnippet(snippet);
        setLocked(locked);
      })
      .catch(() => setSnippet(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUnlock = useCallback(async (password: string) => {
    setError("");
    try {
      const { snippet } = await api.unlockSharedSnippet(id, password);
      setSnippet(snippet);
      setLocked(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Incorrect password");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Snippet not found</h2>
        <p className="text-muted-foreground mb-6">This snippet may have expired or been deleted.</p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <PasswordGate onUnlock={handleUnlock} errorMessage={error} />
      </div>
    );
  }

  const expiryLabel = formatExpiry(snippet.expiresAt);
  const rawUrl = typeof window !== "undefined" ? `${window.location.origin}/raw/${id}` : `/raw/${id}`;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
          <Badge
            className={cn(
              "gap-1",
              snippet.privacy === "password"
                ? "text-amber-500 bg-amber-500/10"
                : "text-green-500 bg-green-500/10"
            )}
          >
            {snippet.privacy === "password" ? (
              <><Lock className="h-3 w-3" /> Protected</>
            ) : (
              <><LinkIcon className="h-3 w-3" /> Secret</>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">
            {snippet.language}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(snippet.createdAt).toLocaleDateString()}
          </span>
          {expiryLabel && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              expiryLabel === "Expired" ? "text-destructive" : "text-amber-500"
            )}>
              <Clock className="h-3 w-3" />
              {expiryLabel}
            </span>
          )}
          {snippet.privacy !== "password" && (
            <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="ml-auto">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
                <FileText className="h-3 w-3" />
                Raw
              </Button>
            </a>
          )}
        </div>

        <CodeViewer code={snippet.code} language={snippet.language} />

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              Open in CVault
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
