"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordGateProps {
  onUnlock: (password: string) => void | Promise<void>;
  errorMessage?: string;
}

export function PasswordGate({ onUnlock, errorMessage }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUnlock = async () => {
    if (!password.trim()) {
      setLocalError("Enter the password to continue.");
      return;
    }

    setSubmitting(true);
    setLocalError("");
    try {
      await onUnlock(password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border/50 bg-card">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <Lock className="h-7 w-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold">Password required</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This snippet is password-protected. Enter the password to view it.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="pr-10 h-11 bg-muted/50 border-border/50 focus:border-amber-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {(localError || errorMessage) && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive"
              >
                {localError || errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            onClick={handleUnlock}
            disabled={submitting}
            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {submitting ? "Unlocking..." : "Unlock"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
