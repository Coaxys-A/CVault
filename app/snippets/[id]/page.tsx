"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Link as LinkIcon, Clock, Edit, Trash2, Share2, ArrowLeft, Copy, Check, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeViewer } from "@/components/code-viewer";
import { api } from "@/lib/api-client";
import { Snippet } from "@/lib/types";
import { formatExpiry } from "@/lib/expiry-format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ViewSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    api.getSnippet(id)
      .then(({ snippet }) => setSnippet(snippet))
      .catch((error) => {
        setSnippet(null);
        if (error instanceof Error && error.message === "Authentication required") router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = useCallback(() => {
    api.deleteSnippet(id)
      .then(() => {
        toast.success("Snippet deleted");
        router.push("/snippets");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to delete snippet"));
  }, [id, router]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${id}` : `/s/${id}`;
  const rawUrl = typeof window !== "undefined" ? `${window.location.origin}/raw/${id}` : `/raw/${id}`;

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  }, [shareUrl]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Snippet not found</h2>
        <p className="text-muted-foreground mb-6">This snippet may have expired or been deleted.</p>
        <Link href="/snippets">
          <Button>Back to snippets</Button>
        </Link>
      </div>
    );
  }

  const expiryLabel = formatExpiry(snippet.expiresAt);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/snippets">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{snippet.title}</h1>
              <Badge
                className={cn(
                  "gap-1",
                  snippet.privacy === "password"
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-primary bg-primary/10"
                )}
              >
                {snippet.privacy === "password" ? (
                  <><Lock className="h-3 w-3" /> Password</>
                ) : (
                  <><LinkIcon className="h-3 w-3" /> Secret</>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <Badge variant="outline" className="font-mono">{snippet.language}</Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/snippets/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Share URL bar */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Share2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs text-muted-foreground truncate flex-1 select-all">{shareUrl}</span>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={handleCopyLink}
            >
              {linkCopied
                ? <><Check className="h-3 w-3 text-green-500" /> Copied</>
                : <><Copy className="h-3 w-3" /> Copy</>
              }
            </Button>
            <a href={rawUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <FileText className="h-3 w-3" />
                Raw
              </Button>
            </a>
          </div>
        </div>

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {snippet.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Separator className="mb-6" />

        <CodeViewer code={snippet.code} language={snippet.language} />
      </motion.div>
    </div>
  );
}
