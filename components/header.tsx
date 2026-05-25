"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Lock, Sun, Moon, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { User } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/snippets", label: "Snippets" },
  { href: "/snippets/new", label: "New" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    api.me().then(({ user }) => setUser(user)).catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    window.location.href = "/login";
  };

  if (pathname.startsWith("/s/")) return null;

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            CVault
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "relative",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-md bg-primary/10"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </motion.div>
            </Button>
          )}

          {user ? (
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", pathname === link.href && "text-primary")}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                Sign out
              </Button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
