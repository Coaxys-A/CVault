import { Snippet } from "./types";

type MockSnippet = Snippet & { password?: string };

export const MOCK_SNIPPETS: MockSnippet[] = [
  {
    id: "abc123",
    title: "Debounce Hook",
    code: `import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;`,
    language: "typescript",
    privacy: "secret",
    expiration: "never",
    tags: ["react", "hooks", "utility"],
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "def456",
    title: "Fast Fibonacci",
    code: `def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number iteratively."""
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Example usage
for i in range(10):
    print(fibonacci(i))`,
    language: "python",
    privacy: "password",
    password: "hello",
    expiration: "1d",
    tags: ["algorithms", "math"],
    createdAt: "2026-05-19T14:30:00Z",
    updatedAt: "2026-05-19T14:30:00Z",
  },
  {
    id: "ghi789",
    title: "CSS Grid Layout",
    code: `.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.grid-item {
  background: var(--card);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}`,
    language: "css",
    privacy: "secret",
    expiration: "never",
    tags: ["css", "layout", "grid"],
    createdAt: "2026-05-18T09:15:00Z",
    updatedAt: "2026-05-18T09:15:00Z",
  },
  {
    id: "jkl012",
    title: "Go HTTP Server",
    code: `package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

type Response struct {
    Status  string \`json:"status"\`
    Message string \`json:"message"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(Response{
        Status:  "ok",
        Message: "Server is running",
    })
}

func main() {
    http.HandleFunc("/health", healthHandler)
    fmt.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
    language: "go",
    privacy: "secret",
    expiration: "1w",
    tags: ["go", "http", "server"],
    createdAt: "2026-05-17T16:45:00Z",
    updatedAt: "2026-05-17T16:45:00Z",
  },
  {
    id: "mno345",
    title: "Rust Vector Ops",
    code: `fn main() {
    let mut numbers: Vec<i32> = vec![1, 2, 3, 4, 5];

    // Push and pop
    numbers.push(6);
    let last = numbers.pop();
    println!("Popped: {:?}", last);

    // Iteration
    for num in numbers.iter() {
        println!("{}", num);
    }

    // Map and collect
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled);
}`,
    language: "rust",
    privacy: "password",
    password: "rustacean",
    expiration: "never",
    tags: ["rust", "vectors", "basics"],
    createdAt: "2026-05-16T11:20:00Z",
    updatedAt: "2026-05-16T11:20:00Z",
  },
];
