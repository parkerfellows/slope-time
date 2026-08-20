import Link from "next/link";
import Image from "next/image";
import { MountainSnow, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Hero background — free Unsplash ski/powder photo.
 * Swap this URL for any other image (or a path inside /public) at any time.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80";

export default function Home() {
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
      {/* Scrim: dark at top and bottom, lighter in the middle */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/75" />

      <SiteHeader variant="overlay" />

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="max-w-2xl space-y-5">
          <h1
            className="animate-fade-up text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl"
            style={{ "--stagger": "0ms" } as React.CSSProperties}
          >
            Driveway to driveway,{" "}
            <span className="text-sky-400">optimized.</span>
          </h1>
          <p
            className="animate-fade-up mx-auto max-w-xl text-balance text-lg leading-relaxed text-white/80 drop-shadow"
            style={{ "--stagger": "100ms" } as React.CSSProperties}
          >
            Tell us when you&apos;re free and where you start. We build the best
            ski day that fits your window.
          </p>
        </div>

        <div
          className="animate-fade-up"
          style={{ "--stagger": "200ms" } as React.CSSProperties}
        >
          <Button
            asChild
            size="lg"
            className="gap-2 px-8 py-6 text-base shadow-xl shadow-sky-950/40"
          >
            <Link href="/plan">
              Plan my ski day
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div
          className="animate-fade-up mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
          style={{ "--stagger": "300ms" } as React.CSSProperties}
        >
          <FeatureCard
            icon={<Clock className="h-5 w-5" />}
            title="Time-constrained"
            description="Enter your window. We handle drive time, parking, gear up, and the trip back."
          />
          <FeatureCard
            icon={<MountainSnow className="h-5 w-5" />}
            title="Utah resorts"
            description="Deer Valley, Park City, Snowbird, Brighton, Solitude. More coming soon."
          />
          <FeatureCard
            icon={<MapPin className="h-5 w-5" />}
            title="Your starting point"
            description="Start anywhere. We calculate the drive and leave the right amount for skiing."
          />
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
    <div className="glass-panel space-y-2.5 p-5 text-left transition-colors duration-200 hover:bg-white/15">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-white/70">{description}</p>
    </div>
  );
}
