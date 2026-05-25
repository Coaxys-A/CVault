"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Code2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/code-editor";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { ExpirationSelector } from "@/components/expiration-selector";
import { TagInput } from "@/components/tag-input";
import { api } from "@/lib/api-client";
import { PrivacyType, Expiration } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SnippetMode = "code" | "text";

export default function NewSnippetPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SnippetMode>("code");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [privacy, setPrivacy] = useState<PrivacyType>("secret");
  const [password, setPassword] = useState("");
  const [expiration, setExpiration] = useState<Expiration>("never");
  const [tags, setTags] = useState<string[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.me()
      .then(({ user }) => {
        if (!user) router.push("/login");
      })
      .catch(() => router.push("/login"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!code.trim()) {
      toast.error(mode === "code" ? "Please add some code" : "Please add some text");
      return;
    }
    if (privacy === "password" && !password.trim()) {
      toast.error("Please set a password");
      return;
    }

    try {
      setSaving(true);
      const { snippet } = await api.createSnippet({
        title: title.trim(),
        code,
        language: mode === "text" ? "plaintext" : language,
        privacy,
        password: privacy === "password" ? password : undefined,
        expiration,
        tags,
      });

      toast.success("Snippet saved!");
      router.push(`/snippets/${snippet.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save snippet");
      if (error instanceof Error && error.message === "Authentication required") router.push("/login");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <motion.div
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New snippet</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Write your {mode === "code" ? "code" : "text"}, set privacy, and share.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Snippet type</Label>
            <div className="flex rounded-lg border border-border/50 bg-muted/50 p-1 gap-1">
              <button
                type="button"
                onClick={() => setMode("code")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                  mode === "code"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </button>
              <button
                type="button"
                onClick={() => setMode("text")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                  mode === "text"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Type className="h-3.5 w-3.5" />
                Text
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={mode === "code" ? "My awesome function..." : "Meeting notes..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 bg-muted/50 border-border/50"
            />
          </div>

          {mode === "code" && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <LanguageSelector value={language} onChange={setLanguage} />
              </div>
              <div className="space-y-2">
                <Label>Expires</Label>
                <ExpirationSelector value={expiration} onChange={setExpiration} />
              </div>
            </div>
          )}

          {mode === "text" && (
            <div className="space-y-2">
              <Label>Expires</Label>
              <ExpirationSelector value={expiration} onChange={setExpiration} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Privacy</Label>
            <PrivacyToggle
              value={privacy}
              onChange={setPrivacy}
              password={password}
              onPasswordChange={setPassword}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {mode === "code" ? (
            <div className="space-y-2">
              <Label>Code</Label>
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Text</Label>
              <Textarea
                placeholder="Write your text here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] bg-muted/50 border-border/50 text-sm leading-relaxed resize-y"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
