"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconFlask, IconCheck } from "@tabler/icons-react";
import Reveal from "@/components/ui/Reveal";

export default function CustomPerfumeSection() {
  return (
    <section className="py-12 md:py-16 bg-pink-50 relative overflow-hidden border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden bg-white border border-line shadow-card">
              <Image
                src="/card1.jpeg"
                alt="Custom fragrance blending"
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A35]/85 via-[#2A2A35]/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-2">
                  Made for you
                </span>
                <p className="font-display text-xl leading-snug">
                  Blended by hand for your one-of-a-kind signature
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-line text-pink text-xs font-semibold mb-5">
                <IconFlask className="w-3.5 h-3.5" stroke={2} />
                Bespoke Studio
              </span>

              <h2 className="font-display text-2xl sm:text-3xl md:text-[38px] text-noir leading-tight mb-4">
                Create your own <span className="text-gradient">custom perfume</span>
              </h2>

              <p className="text-stone text-sm md:text-base leading-relaxed mb-7">
                Work with our blending experts to build a scent that is entirely yours — from
                the notes and the strength right down to the bottle it lives in.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  ["Personal consultation", "Choose your top, heart and base notes."],
                  ["Monogrammed bottle", "A custom flacon with your name or initials."],
                  ["Formula saved for life", "We store your blend so reordering takes seconds."],
                ].map(([title, copy]) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-line flex items-center justify-center shrink-0 mt-0.5">
                      <IconCheck className="w-3.5 h-3.5 text-pink" stroke={2.5} />
                    </span>
                    <p className="text-sm text-stone">
                      <strong className="text-noir font-semibold">{title}:</strong> {copy}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/custom-perfume"
                className="inline-flex items-center gap-2 px-8 h-12 rounded-full text-white text-sm font-semibold transition-all duration-300 hover:shadow-pink hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
              >
                Start Creating
                <IconArrowRight className="w-4 h-4" stroke={2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
