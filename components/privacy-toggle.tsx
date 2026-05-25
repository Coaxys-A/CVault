"use client";

import { motion } from "framer-motion";
import { Lock, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PrivacyType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
  value: PrivacyType;
  onChange: (value: PrivacyType) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  passwordPlaceholder?: string;
}

export function PrivacyToggle({
  value,
  onChange,
  password,
  onPasswordChange,
  passwordPlaceholder = "Enter a password...",
}: PrivacyToggleProps) {
  return (
    <div>
      <div className="flex rounded-lg border border-border/50 bg-muted/50 p-1 gap-1">
        <button
          type="button"
          onClick={() => onChange("secret")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
            value === "secret"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Secret Link
        </button>
        <button
          type="button"
          onClick={() => onChange("password")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
            value === "password"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Lock className="h-3.5 w-3.5" />
          Password
        </button>
      </div>

      {value === "password" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <Input
            type="text"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="mt-3 h-10 bg-muted/50 border-border/50 focus:border-amber-500/50"
          />
        </motion.div>
      )}
    </div>
  );
}
