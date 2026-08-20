import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  /** "overlay" sits on top of photo backgrounds; "solid" is the standard footer. */
  variant?: "overlay" | "solid";
}

export function SiteFooter({ variant = "solid" }: SiteFooterProps) {
  const isOverlay = variant === "overlay";

  return (
    <footer
      className={cn(
        "shrink-0 px-6 py-5",
        isOverlay ? "relative z-10" : "border-t bg-background"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs sm:flex-row",
          isOverlay ? "text-white/50" : "text-muted-foreground"
        )}
      >
        <p>BestLine · Utah ski day optimizer</p>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={cn(
              "transition-colors",
              isOverlay ? "hover:text-white" : "hover:text-foreground"
            )}
          >
            Conditions
          </Link>
          <Link
            href="/plan"
            className={cn(
              "transition-colors",
              isOverlay ? "hover:text-white" : "hover:text-foreground"
            )}
          >
            Plan a day
          </Link>
          <Link
            href="/waitlist"
            className={cn(
              "transition-colors",
              isOverlay ? "hover:text-white" : "hover:text-foreground"
            )}
          >
            What&apos;s next
          </Link>
        </nav>
      </div>
    </footer>
  );
}
