import Image from "next/image";
import { Bike, Zap, Map } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: "BestLine · What's Next",
  description:
    "Cycling mode, live grooming data, and more resorts are on the way. Join the list to hear when they ship.",
};

export default function WaitlistPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Skier carving through fresh powder on a Utah mountain"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/80" />

      <SiteHeader variant="overlay" />

      {/* Content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6 py-14">
        <div
          className="animate-fade-up max-w-xl space-y-4 text-center"
          style={{ "--stagger": "0ms" } as React.CSSProperties}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Coming soon
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
            More modes. <span className="text-sky-400">Same precision.</span>
          </h1>
          <p className="text-balance leading-relaxed text-white/75">
            Cycling mode, smarter resort selection, and real-time grooming data.
            Leave your email and we&apos;ll tell you when each update ships.
          </p>
        </div>

        {/* Upcoming features */}
        <div
          className="animate-fade-up grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3"
          style={{ "--stagger": "120ms" } as React.CSSProperties}
        >
          <FeatureCard
            icon={<Bike className="h-5 w-5" />}
            title="Cycling mode"
            description="Time-constrained road routes built around your window and starting point."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Live grooming"
            description="Real grooming reports layered into your plan, not just lift status."
          />
          <FeatureCard
            icon={<Map className="h-5 w-5" />}
            title="More resorts"
            description="Expanding beyond Utah: Jackson Hole, Mammoth, Tahoe, and more."
          />
        </div>

        {/* Form card */}
        <div
          className="glass-panel animate-fade-up w-full max-w-sm space-y-5 p-6"
          style={{ "--stagger": "240ms" } as React.CSSProperties}
        >
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Stay in the loop</h2>
            <p className="text-sm text-white/60">
              No spam. Just updates when things ship.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <SiteFooter variant="overlay" />
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel space-y-2.5 p-4 transition-colors duration-200 hover:bg-white/15">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-white/65">{description}</p>
    </div>
  );
}
