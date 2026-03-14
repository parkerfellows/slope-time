import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata = {
  title: "BestLine — Conditions Chat",
  description:
    "Ask about live snow, weather, lift status, and which Utah resort to ski today.",
};

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Nav */}
      <nav className="border-b px-4 py-2.5 flex items-center gap-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors"
        >
          <MountainSnow className="h-4 w-4 text-primary" />
          BestLine
        </Link>
        <span className="text-muted-foreground text-xs">/</span>
        <span className="text-sm text-muted-foreground">Conditions Chat</span>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Conditions
          </Link>
          <Link
            href="/plan"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Plan my day →
          </Link>
        </div>
      </nav>

      {/* Chat fills remaining height */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full min-h-0">
        <ChatWindow />
      </div>
    </main>
  );
}
