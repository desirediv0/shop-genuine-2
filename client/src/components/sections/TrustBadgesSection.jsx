"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import { IconAward, IconLeaf, IconPackage, IconShield, IconTruck, IconHeadset } from "@tabler/icons-react";

const BADGES = [
  {
    icon: IconShield,
    title: "100% Authentic",
    description: "Every product is sourced directly from the brand or its authorised distributor",
    tint: "#FCE7F0",
    color: "#F97316",
  },
  {
    icon: IconLeaf,
    title: "Skin-Safe Formulas",
    description: "Dermatologically tested picks with clearly listed ingredients",
    tint: "#F4FAEA",
    color: "#6FA32B",
  },
  {
    icon: IconPackage,
    title: "Secure Packaging",
    description: "Sealed, cushioned and tamper-proof so it arrives exactly as it left us",
    tint: "#FFF4EC",
    color: "#F97316",
  },
  {
    icon: IconTruck,
    title: "Fast Delivery",
    description: "Dispatched within 24–48 hours with tracking on every order",
    tint: "#EEF3FC",
    color: "#1D4ED8",
  },
  {
    icon: IconHeadset,
    title: "Beauty Support",
    description: "Talk to our advisors for shade matches and routine help, 7 days a week",
    tint: "#FBEFF7",
    color: "#D95E08",
  },
  {
    icon: IconAward,
    title: "Trusted Brands",
    description: "A curated shelf of the labels loved by makeup artists and dermatologists",
    tint: "#EDF6FB",
    color: "#3B82F6",
  },
];

export default function TrustBadgesSection() {
  return (
    <section className="py-12 md:py-16 bg-white border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-9 md:mb-12">
            <span className="luxe-eyebrow">Why shop with us</span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-[34px] text-noir leading-tight mt-1.5">
              The <span className="text-gradient">Shop Genuine</span> promise
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {BADGES.map(({ icon: Icon, title, description, tint, color }, idx) => (
            <Reveal key={title} delay={idx * 0.06}>
              <div className="flex items-start gap-4 p-5 md:p-6 rounded-2xl border border-line bg-white h-full transition-all duration-300 hover:-translate-y-1 hover:border-pink/40 hover:shadow-card-hover">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tint }}
                >
                  <Icon className="h-[22px] w-[22px]" stroke={1.9} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-noir mb-1">{title}</h3>
                  <p className="text-[13px] text-stone leading-relaxed">{description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
