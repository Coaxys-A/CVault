"use client";

import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">CVault</span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1 text-sm text-muted-foreground">
            <p>
              Designed & built by{" "}
              <a
                href="https://www.arsamsabbagh.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Coaxys
              </a>
            </p>
            <p className="text-xs">Private code snippets, shared on your terms.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
