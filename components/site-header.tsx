"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MountainSnow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Conditions" },
  { href: "/chat", label: "Chat" },
  { href: "/waitlist", label: "What's next" },
] as const;

interface SiteHeaderProps {
  /** "overlay" sits on top of photo backgrounds; "solid" is the standard app bar. */
  variant?: "overlay" | "solid";
}

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const pathname = usePathname();
  const isOverlay = variant === "overlay";

  return (
    <header
      className={cn(
        "h-16 shrink-0",
        isOverlay
          ? "relative z-10"
          : "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-lg font-bold tracking-tight transition-colors",
            isOverlay ? "text-white hover:text-sky-300" : "hover:text-primary"
          )}
        >
          <MountainSnow
            className={cn("h-5 w-5", isOverlay ? "text-sky-400" : "text-primary")}
          />
          BestLine
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hidden rounded-md px-3 py-2 text-sm font-medium transition-colors sm:block",
                  isOverlay
                    ? isActive
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                    : isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
          <Button asChild size="sm" className={cn("ml-1", isOverlay && "shadow-lg")}>
            <Link href="/plan">Plan my day</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
