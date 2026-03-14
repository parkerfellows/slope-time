import Link from "next/link";
import { MountainSnow, Bike, Zap, Map } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80";

export default function WaitlistPage() {
  return (
    <main
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url('${HERO_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/75 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-white hover:text-blue-400 transition-colors"
        >
          <MountainSnow className="h-5 w-5 text-blue-400" />
          BestLine
        </Link>
      </nav>

      {/* Content */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 gap-10">
        <div className="space-y-3 max-w-xl text-center">
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase">
            Coming soon
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            More modes. <span className="text-blue-400">Same precision.</span>
          </h1>
          <p className="text-white/75 text-base leading-relaxed">
            Cycling mode, smarter resort selection, real-time grooming data, and
            more. Leave your email and we&apos;ll let you know when each update ships.
          </p>
        </div>

        {/* Upcoming features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          <FeatureCard
            icon={<Bike className="h-5 w-5 text-blue-400" />}
            title="Cycling mode"
            description="Time-constrained road routes built around your window and starting point."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-blue-400" />}
            title="Live grooming"
            description="Real grooming reports layered into your plan, not just lift status."
          />
          <FeatureCard
            icon={<Map className="h-5 w-5 text-blue-400" />}
            title="More resorts"
            description="Expanding beyond Utah — Jackson Hole, Mammoth, Tahoe, and more."
          />
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-white font-bold text-lg">Stay in the loop</h2>
            <p className="text-white/60 text-sm">No spam. Just updates when things ship.</p>
          </div>
          <WaitlistForm />
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
    <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-2">
      {icon}
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      <p className="text-xs text-white/65 leading-relaxed">{description}</p>
    </div>
  );
}
