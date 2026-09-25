"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconSparkles,
  IconShieldCheck,
  IconLeaf,
  IconAward,
  IconHeartHandshake,
  IconPlayerPlay,
  IconArrowRight,
} from "@tabler/icons-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: IconShieldCheck,
      title: "100% Authentic",
      desc: "Guaranteed authentic formulations sourced from official ingredient houses.",
    },
    {
      icon: IconLeaf,
      title: "Botanical Purity",
      desc: "Sustainably harvested raw extracts without toxic additives or harsh synthetics.",
    },
    {
      icon: IconAward,
      title: "Trusted Sourcing",
      desc: "Every product sourced directly from verified, official brand partners.",
    },
    {
      icon: IconHeartHandshake,
      title: "Quality Checked",
      desc: "Carefully inspected and quality-tested before it reaches your doorstep.",
    },
  ];

  const processSteps = [
    {
      num: "01",
      title: "Verified Brand Sourcing",
      description:
        "Every product is sourced directly from official brands and authorized distributors — no third-party resellers.",
      videoPlaceholder: "Verified Sourcing Network",
      tag: "Authentic Sourcing",
    },
    {
      num: "02",
      title: "Quality & Authenticity Checks",
      description:
        "Each item is inspected for authenticity, packaging integrity, and expiry before it enters our warehouse.",
      videoPlaceholder: "Authenticity Verification",
      tag: "Quality Checked",
    },
    {
      num: "03",
      title: "Safe, Controlled Storage",
      description:
        "Nutrition, pharmacy, and cosmetics items are stored under proper conditions to preserve quality until dispatch.",
      videoPlaceholder: "Warehouse Storage",
      tag: "Proper Storage",
    },
    {
      num: "04",
      title: "Order Quality Review",
      description:
        "Every order is reviewed for accuracy and condition before it leaves our facility.",
      videoPlaceholder: "Order Quality Review",
      tag: "Double Checked",
    },
    {
      num: "05",
      title: "Secure, Careful Packing",
      description:
        "Products are packed securely to prevent damage in transit, with extra care for fragile and sensitive items.",
      videoPlaceholder: "Secure Packing Process",
      tag: "Careful Packing",
    },
    {
      num: "06",
      title: "Fast, Tracked Dispatch",
      description:
        "Orders are dispatched quickly with real-time tracking, so you always know where your order is.",
      videoPlaceholder: "Dispatch & Delivery",
      tag: "Fast Dispatch",
    },
  ];

  return (
    <main className="bg-white text-noir overflow-hidden pt-24 pb-20">
      {/* ── HERO BANNER SECTION WITH LUXURY IMAGE ── */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#FFF5F9] via-white to-white overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#F97316]/10 to-[#FB923C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#F49CC2]/40 shadow-soft animate-fade-in">
                <IconSparkles className="w-4 h-4 text-pink" />
                <span className="text-xs uppercase tracking-[0.12em] font-semibold text-pink">
                  Our Story
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light text-noir tracking-tight leading-[1.15]">
                Everything Genuine,{" "}
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#FB923C]">
                  All In One Place
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                Discover the story behind Shop Genuine — a trusted destination for authentic nutrition, grocery, pharmacy and cosmetics products.
              </p>

              {/* Quick CTA */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white text-sm font-semibold tracking-wide shadow-pink hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Explore Collection
                  <IconArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#our-origin"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white border border-line text-noir text-sm font-medium hover:border-pink hover:text-pink transition-all duration-300"
                >
                  Read Our Story
                </a>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-line shadow-2xl bg-pink-50 group">
                <Image
                  src="/about_maison_atelier.png"
                  alt="Shop Genuine Store Display"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-300 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block">
                    Trusted Since Day One
                  </span>
                  <p className="text-xl font-display font-light">Shop Genuine</p>
                  <p className="text-xs text-white/80">Nutrition, Grocery, Pharmacy &amp; Cosmetics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-pink-100 hover:border-pink/40 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" stroke={1.8} />
                  </div>
                  <h3 className="text-base font-semibold text-noir mb-1.5">{p.title}</h3>
                  <p className="text-xs text-stone leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 1: SHOP GENUINE ORIGIN WITH SIDE IMAGE ── */}
      <section id="our-origin" className="py-20 sm:py-28 border-t border-line/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image Showcase */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-line shadow-xl bg-pink-50 group">
                <Image
                  src="/about_luxury_cosmetics.png"
                  alt="Crafted With Purpose - Shop Genuine"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs uppercase tracking-widest text-pink-200 font-semibold mb-1">Our Philosophy</p>
                  <p className="text-lg font-semibold">Genuine, Every Time</p>
                </div>
              </div>
            </div>

            {/* Right Story Content */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs uppercase tracking-[0.15em] text-pink font-semibold block">
                01. Shop Genuine Origin
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light text-noir leading-tight">
                Built On Trust, Made For{" "}
                <em className="italic text-pink font-normal">Everyday Life</em>
              </h2>

              <div className="w-20 h-0.5 bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-full" />

              <p className="text-base sm:text-lg text-noir/80 leading-relaxed font-normal bg-pink-50/40 p-6 sm:p-8 rounded-3xl border border-pink-100/60 shadow-soft">
                Shop Genuine was born from a simple belief — that finding authentic, everyday essentials shouldn&apos;t be a gamble. We bring together nutrition, grocery, pharmacy and cosmetics under one trusted roof, sourced directly from official brands so you always know exactly what you&apos;re getting. From your daily supplements to your skincare routine, from pantry staples to pharmacy needs, every product on Shop Genuine is chosen with one promise in mind — genuine, every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE ATELIER PROCESS ── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-pink-50/30 to-white border-t border-line/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.15em] text-pink font-semibold block">
              02. Our Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light text-noir">
              From Verified Source To Your Doorstep
            </h2>
            <p className="text-sm text-stone italic">
              Our 6-step quality process ensuring every order is genuine and delivered right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-line hover:border-pink/50 shadow-sm hover:shadow-pink transition-all duration-300 flex flex-col group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-display font-semibold text-pink">{step.num}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-pink-50 text-pink border border-pink-100">
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-noir mb-3 group-hover:text-pink transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone leading-relaxed mb-6 flex-1">
                  {step.description}
                </p>

                {/* Video showcase placeholder */}
                <div className="relative aspect-video rounded-xl bg-pink-50/60 border border-pink-100 flex flex-col items-center justify-center p-4 text-center overflow-hidden group-hover:border-pink/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <IconPlayerPlay className="w-4 h-4 ml-0.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-noir">
                    {step.videoPlaceholder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CTA BANNER ── */}
      <section className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#F97316] to-[#FB923C] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-white">
              Discover Authentic Products
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light leading-tight">
              Ready To Shop Genuine?
            </h2>

            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-normal">
              Explore our curated range of authentic nutrition, grocery, pharmacy and cosmetics products.
            </p>

            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-pink text-sm font-semibold tracking-wide shadow-lg hover:bg-pink-50 transition-all duration-300 hover:scale-105"
              >
                Shop All Products
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
