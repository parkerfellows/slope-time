import { ChatWindow } from "@/components/ChatWindow";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "BestLine · Conditions Chat",
  description:
    "Ask about live snow, weather, lift status, and which Utah resort to ski today.",
};

export default function ChatPage() {
  return (
    <main className="flex h-[100dvh] flex-col bg-background">
      <SiteHeader />

      {/* Chat fills remaining height */}
      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
        <ChatWindow />
      </div>
    </main>
  );
}
