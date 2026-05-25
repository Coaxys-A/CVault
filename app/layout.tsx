import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";

const geistSans = localFont({
  src: [
    { path: "../public/fonts/geist-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/geist-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/geist-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/geist-700.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/geist-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    { path: "../public/fonts/geist-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/geist-mono-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/geist-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "CVault — Private Code Snippets",
  description: "A private alternative to GitHub Gist. Share code via secret links or password protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
