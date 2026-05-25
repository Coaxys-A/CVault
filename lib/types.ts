export type PrivacyType = "secret" | "password";

export type Expiration = "never" | "1h" | "1d" | "1w";

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  privacy: PrivacyType;
  expiration: Expiration;
  expiresAt?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}

export const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "json",
  "markdown",
  "rust",
  "go",
  "java",
  "cpp",
  "xml",
  "php",
  "plaintext",
] as const;

export const EXPIRATION_OPTIONS: { value: Expiration; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
];
