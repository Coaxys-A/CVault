"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [challenge, setChallenge] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCaptcha = async () => {
    const { challenge } = await api.captcha();
    setChallenge(challenge);
    setCaptcha("");
  };

  useEffect(() => {
    api.captcha()
      .then(({ challenge }) => setChallenge(challenge))
      .catch(() => toast.error("Unable to load captcha"));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.register(name, username, password, captcha);
      toast.success("Account created");
      router.push("/snippets");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
      await loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full rounded-xl border border-border/50 bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">Create a fully local account for CVault.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 bg-muted/50 border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-11 bg-muted/50 border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 bg-muted/50 border-border/50"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="captcha">Captcha: {challenge || "Loading..."}</Label>
              <Button type="button" variant="ghost" size="icon-sm" onClick={loadCaptcha}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="captcha"
              inputMode="numeric"
              value={captcha}
              onChange={(event) => setCaptcha(event.target.value)}
              className="h-11 bg-muted/50 border-border/50"
              required
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
