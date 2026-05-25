"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, KeyRound, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Lock,
    title: "Secret Links",
    description: "Share snippets via unlisted links. Only people with the link can find them — no indexing, no discoverability.",
  },
  {
    icon: KeyRound,
    title: "Password Lock",
    description: "Add an extra layer: even with the link, viewers need a password to see your code.",
  },
  {
    icon: Code2,
    title: "Rich Editor",
    description: "Syntax highlighting for 13+ languages, line numbers, and a polished code experience that just works.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl animate-glow-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-32 pb-16 sm:pb-24 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Lock className="h-3.5 w-3.5" />
            Private by default
          </div>
        </motion.div>

        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
        >
          Your snippets,{" "}
          <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            kept private
          </span>
        </motion.h1>

        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
        >
          A private code vault with local accounts, secret links, password protection, and a beautiful editor. Share code or plain text on your terms.
        </motion.p>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/snippets/new">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="gap-2 text-base px-8 h-12">
                Create a snippet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
          <Link href="/snippets">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                Browse snippets
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className="mx-auto max-w-6xl px-4 sm:px-6 pb-24"
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
