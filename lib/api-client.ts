import { Expiration, PrivacyType, Snippet, User } from "@/lib/types";

interface ApiErrorBody {
  error?: string;
}

export interface SnippetPayload {
  title: string;
  code: string;
  language: string;
  privacy: PrivacyType;
  password?: string;
  expiration: Expiration;
  tags: string[];
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    throw new Error(body.error ?? "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () => apiRequest<{ user: User | null }>("/api/auth/me"),
  captcha: () => apiRequest<{ challenge: string }>("/api/auth/captcha"),
  login: (username: string, password: string, captcha: string) =>
    apiRequest<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, captcha }),
    }),
  register: (name: string, username: string, password: string, captcha: string) =>
    apiRequest<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, username, password, captcha }),
    }),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
  listSnippets: () => apiRequest<{ snippets: Snippet[] }>("/api/snippets"),
  createSnippet: (payload: SnippetPayload) =>
    apiRequest<{ snippet: Snippet }>("/api/snippets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSnippet: (id: string) => apiRequest<{ snippet: Snippet }>(`/api/snippets/${id}`),
  updateSnippet: (id: string, payload: SnippetPayload) =>
    apiRequest<{ snippet: Snippet }>(`/api/snippets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteSnippet: (id: string) =>
    apiRequest<void>(`/api/snippets/${id}`, {
      method: "DELETE",
    }),
  getSharedSnippet: (id: string) => apiRequest<{ snippet: Snippet; locked: boolean }>(`/api/share/${id}`),
  unlockSharedSnippet: (id: string, password: string) =>
    apiRequest<{ snippet: Snippet }>(`/api/share/${id}/unlock`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};
