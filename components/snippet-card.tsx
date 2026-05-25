"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Link as LinkIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Snippet } from "@/lib/types";
import { formatExpiry } from "@/lib/expiry-format";
import { cn } from "@/lib/utils";

interface SnippetCardProps {
  snippet: Snippet;
  view: "grid" | "list";
  index?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function SnippetCard({ snippet, view, index = 0 }: SnippetCardProps) {
  const isGrid = view === "grid";

  return (
    <motion.div
      layout
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 260,
        damping: 25,
      }}
      whileHover={{ y: -3, scale: 1.01 }}
    >
      <Link href={`/snippets/${snippet.id}`}>
        <div
          className={cn(
            "group rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:bg-primary/[0.02]",
            isGrid ? "" : "flex items-center gap-4"
          )}
        >
          <div className={cn("flex-1", isGrid ? "" : "min-w-0")}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{snippet.title}</h3>
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 gap-1 text-xs",
                  snippet.privacy === "password"
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-primary bg-primary/10"
                )}
              >
                {snippet.privacy === "password" ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <LinkIcon className="h-3 w-3" />
                )}
                {snippet.privacy === "password" ? "Password" : "Secret"}
              </Badge>
            </div>

            {isGrid && (
              <pre className="mt-3 line-clamp-4 text-xs font-mono text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-hidden leading-relaxed">
                {snippet.code}
              </pre>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs font-mono">
                {snippet.language}
              </Badge>
              {snippet.expiration !== "never" && (() => {
                const label = formatExpiry(snippet.expiresAt);
                return label ? (
                  <span className={cn(
                    "flex items-center gap-1",
                    label === "Expired" ? "text-destructive" : "text-amber-500"
                  )}>
                    <Clock className="h-3 w-3" />
                    {label}
                  </span>
                ) : null;
              })()}
              <span className="ml-auto">{timeAgo(snippet.createdAt)}</span>
            </div>

            {snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {snippet.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {snippet.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{snippet.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
