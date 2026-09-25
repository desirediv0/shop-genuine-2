"use client";

import Link from "next/link";
import { IconSparkles, IconArrowRight, IconCompass, IconWand } from "@tabler/icons-react";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  { n: "01", label: "Tell us your vibe" },
  { n: "02", label: "Pick your notes" },
  { n: "03", label: "Get your match" },
];

export default function FragranceFinderSection() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14"
            style={{ background: "linear-gradient(135deg,#D95E08 0%,#F97316 50%,#F97316 100%)" }}
          >
            {/* Decorative blooms */}
            <span className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-4">
                  <IconSparkles className="w-3.5 h-3.5" stroke={2} />
                  Scent Discovery
                </span>

                <h2 className="font-display text-2xl sm:text-3xl md:text-[38px] text-white leading-tight mb-3">
                  Find your <span className="text-white/95 underline decoration-white/40 decoration-4 underline-offset-4">signature scent</span>
                </h2>

                <p className="text-white/85 text-sm md:text-base leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0">
                  Not sure where to start? Take our 2-minute quiz and get a personalised
                  fragrance shortlist picked for your personality and occasion.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/fragrance-finder"
                    className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-white text-pink text-sm font-semibold transition-all duration-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    <IconCompass className="w-4 h-4" stroke={2} />
                    Start the Quiz
                    <IconArrowRight className="w-4 h-4" stroke={2} />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full border border-white/60 text-white text-sm font-semibold transition-colors duration-300 hover:bg-white/15 w-full sm:w-auto"
                  >
                    Browse All
                  </Link>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-3.5">
                {STEPS.map(({ n, label }) => (
                  <div
                    key={n}
                    className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3.5 rounded-2xl bg-white/15 backdrop-blur-sm px-3 py-4 lg:px-5 lg:py-3.5 text-center lg:text-left"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-full bg-white text-pink text-[13px] font-bold flex items-center justify-center">
                      {n}
                    </span>
                    <span className="text-white text-xs sm:text-[13px] font-medium leading-snug">
                      {label}
                    </span>
                  </div>
                ))}
                <div className="hidden lg:flex items-center gap-2 text-white/75 text-xs pl-1 pt-1">
                  <IconWand className="w-4 h-4" stroke={2} />
                  Takes under 2 minutes
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
