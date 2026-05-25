"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      (e.target as HTMLInputElement).value = "";
    }
    if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/50 bg-muted/50 px-3 py-2 focus-within:border-primary/50 transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
        onKeyDown={handleKeyDown}
        className="border-0 bg-transparent p-0 h-6 text-sm shadow-none focus-visible:ring-0 flex-1 min-w-[80px]"
      />
    </div>
  );
}
