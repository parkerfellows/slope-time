import Link from "next/link";
import { MountainSnow, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Hero background — free Unsplash ski/powder photo.
 * Swap this URL for any other image (or a path inside /public) at any time.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url('${HERO_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Gradient overlay — dark at top & bottom, slightly lighter in the middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <MountainSnow className="h-5 w-5 text-blue-400" />
          BestLine
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10">
            <Link href="/dashboard">Conditions</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10">
            <Link href="/chat">Chat</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/plan">Plan my day</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-lg">
            Driveway to driveway,{" "}
            <span className="text-blue-400">optimized.</span>
          </h1>
          <p className="text-lg text-white/80 drop-shadow">
            Tell BestLine when you&apos;re free and where you&apos;re starting
            from. We&apos;ll build the best possible ski session that fits your
            window — accounting for drive time, lift lines, and your terrain
            preferences.
          </p>
        </div>

        <Button asChild size="lg" className="gap-2 text-base px-8 py-6 shadow-lg">
          <Link href="/plan">
            Plan my ski day
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mt-8">
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-blue-400" />}
            title="Time-constrained"
            description="Enter your window and we handle the math — drive time, parking, gear up, and back."
          />
          <FeatureCard
            icon={<MountainSnow className="h-6 w-6 text-blue-400" />}
            title="Utah resorts"
            description="Deer Valley, Park City, Snowbird, Brighton, Solitude. More coming soon."
          />
          <FeatureCard
            icon={<MapPin className="h-6 w-6 text-blue-400" />}
            title="Your starting point"
            description="Start anywhere. We calculate drive time and leave the right amount for skiing."
          />
        </div>
      </section>

      <footer className="relative z-10 px-6 py-4 text-center text-xs text-white/40">
        BestLine — Utah ski optimizer &mdash; Phase 1 MVP
      </footer>
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
    <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-5 text-left space-y-2">
      {icon}
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      <p className="text-xs text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}
