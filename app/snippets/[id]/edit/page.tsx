"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
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

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [privacy, setPrivacy] = useState<PrivacyType>("secret");
  const [password, setPassword] = useState("");
  const [expiration, setExpiration] = useState<Expiration>("never");
  const [tags, setTags] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isText, setIsText] = useState(false);
  const [originalPrivacy, setOriginalPrivacy] = useState<PrivacyType>("secret");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSnippet(id)
      .then(({ snippet: s }) => {
      setTitle(s.title);
      setCode(s.code);
      setLanguage(s.language);
      setPrivacy(s.privacy);
      setOriginalPrivacy(s.privacy);
      setPassword("");
      setExpiration(s.expiration);
      setTags(s.tags);
      setIsText(s.language === "plaintext");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Snippet not found");
        if (error instanceof Error && error.message === "Authentication required") router.push("/login");
      })
      .finally(() => setLoaded(true));
  }, [id, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!code.trim()) {
      toast.error("Please add some content");
      return;
    }

    if (saving) return;

    if (privacy === "password" && originalPrivacy !== "password" && !password.trim()) {
      toast.error("Set a password for password-protected snippets");
      return;
    }

    try {
      setSaving(true);
      await api.updateSnippet(id, {
        title: title.trim(),
        code,
        language: isText ? "plaintext" : language,
        privacy,
        password: privacy === "password" && password.trim() ? password : undefined,
        expiration,
        tags,
      });

      toast.success("Snippet updated!");
      router.push(`/snippets/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update snippet");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <motion.div
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href={`/snippets/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to snippet
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit snippet</h1>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 bg-muted/50 border-border/50"
            />
          </div>

          {!isText && (
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

          {isText && (
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
              passwordPlaceholder={originalPrivacy === "password" ? "Leave blank to keep current password" : "Enter a password..."}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {isText ? (
            <div className="space-y-2">
              <Label>Text</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] bg-muted/50 border-border/50 text-sm leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Code</Label>
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
