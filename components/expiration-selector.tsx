"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPIRATION_OPTIONS, Expiration } from "@/lib/types";

interface ExpirationSelectorProps {
  value: Expiration;
  onChange: (value: Expiration) => void;
}

export function ExpirationSelector({ value, onChange }: ExpirationSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as Expiration)}>
      <SelectTrigger className="w-[180px] bg-muted/50 border-border/50">
        <SelectValue placeholder="Expires" />
      </SelectTrigger>
      <SelectContent>
        {EXPIRATION_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
