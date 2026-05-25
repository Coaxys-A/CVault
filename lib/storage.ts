import { Snippet } from "./types";
import { MOCK_SNIPPETS } from "./mock-data";

const STORAGE_KEY = "vault_snippets";

export function getSnippets(): Snippet[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveSnippet(snippet: Snippet): void {
  const snippets = getSnippets();
  const idx = snippets.findIndex((s) => s.id === snippet.id);
  if (idx >= 0) {
    snippets[idx] = snippet;
  } else {
    snippets.unshift(snippet);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function getSnippet(id: string): Snippet | undefined {
  return getSnippets().find((s) => s.id === id);
}

export function deleteSnippet(id: string): void {
  const snippets = getSnippets().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function initMockData(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SNIPPETS));
}
