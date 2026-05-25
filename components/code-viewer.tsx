"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

const CodeMirrorViewer = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

const langExtensions: Record<string, () => Promise<unknown>> = {
  javascript: () => import("@codemirror/lang-javascript").then((m) => m.javascript()),
  typescript: () => import("@codemirror/lang-javascript").then((m) => m.javascript({ jsx: true, typescript: true })),
  python: () => import("@codemirror/lang-python").then((m) => m.python()),
  html: () => import("@codemirror/lang-html").then((m) => m.html()),
  css: () => import("@codemirror/lang-css").then((m) => m.css()),
  json: () => import("@codemirror/lang-json").then((m) => m.json()),
  markdown: () => import("@codemirror/lang-markdown").then((m) => m.markdown()),
  rust: () => import("@codemirror/lang-rust").then((m) => m.rust()),
  go: () => import("@codemirror/lang-go").then((m) => m.go()),
  java: () => import("@codemirror/lang-java").then((m) => m.java()),
  cpp: () => import("@codemirror/lang-cpp").then((m) => m.cpp()),
  xml: () => import("@codemirror/lang-xml").then((m) => m.xml()),
  php: () => import("@codemirror/lang-php").then((m) => m.php()),
};

type ThemeName = "dark" | "light" | "dracula" | "monokai" | "github-dark" | "nord";

const THEMES: { value: ThemeName; label: string }[] = [
  { value: "dark", label: "One Dark" },
  { value: "dracula", label: "Dracula" },
  { value: "monokai", label: "Monokai" },
  { value: "nord", label: "Nord" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "light", label: "Light" },
];

const THEME_STORAGE_KEY = "cvault:editor-theme";

async function loadThemeExtension(name: ThemeName): Promise<"dark" | "light" | Extension> {
  switch (name) {
    case "dark": return "dark";
    case "light": return "light";
    case "dracula": {
      const { dracula } = await import("@uiw/codemirror-theme-dracula");
      return dracula;
    }
    case "monokai": {
      const { monokai } = await import("@uiw/codemirror-theme-monokai");
      return monokai;
    }
    case "github-dark": {
      const { githubDark } = await import("@uiw/codemirror-theme-github");
      return githubDark;
    }
    case "nord": {
      const { nord } = await import("@uiw/codemirror-theme-nord");
      return nord;
    }
  }
}

interface CodeViewerProps {
  code: string;
  language: string;
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const [langExtension, setLangExtension] = useState<Extension | null>(null);
  const [copied, setCopied] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [themeExtension, setThemeExtension] = useState<"dark" | "light" | Extension>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (stored && THEMES.some((t) => t.value === stored)) setThemeName(stored);
  }, []);

  useEffect(() => {
    loadThemeExtension(themeName).then(setThemeExtension);
  }, [themeName]);

  useEffect(() => {
    const loader = langExtensions[language];
    if (loader) {
      loader().then((ext) => setLangExtension(ext as Extension));
    } else {
      setLangExtension(null);
    }
  }, [language]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleThemeChange = useCallback((name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(THEME_STORAGE_KEY, name);
  }, []);

  const extensions: Extension[] = [
    ...(langExtension ? [langExtension] : []),
    EditorView.lineWrapping,
    EditorView.editable.of(false),
  ];

  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/30">
        <select
          value={themeName}
          onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
          className="text-xs bg-transparent text-muted-foreground hover:text-foreground cursor-pointer outline-none py-0.5 pr-1"
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value} className="bg-background text-foreground">
              {t.label}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <CodeMirrorViewer
        value={code}
        extensions={extensions}
        theme={themeExtension}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: false,
          bracketMatching: true,
          foldGutter: true,
        }}
      />
    </div>
  );
}
