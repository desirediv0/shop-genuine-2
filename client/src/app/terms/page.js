import Link from "next/link";
import {
  IconGavel,
  IconShieldCheck,
  IconCreditCard,
  IconChevronRight,
  IconSparkles,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";

export const metadata = {
  title: "Terms & Conditions | Shop Genuine",
  description: "Read Shop Genuine Terms & Conditions, user terms of service, purchasing rules, and platform usage agreements.",
};

const keyTerms = [
  {
    icon: IconGavel,
    title: "Terms of Service",
    desc: "Binding user agreement for ordering, browsing, and accessing Shop Genuine platform.",
  },
  {
    icon: IconShieldCheck,
    title: "100% Authentic Guarantee",
    desc: "All formulations sourced from official brand channels and quality assured.",
  },
  {
    icon: IconCreditCard,
    title: "Secure Payments",
    desc: "PCI-DSS compliant encrypted transactions in Indian Rupees (INR).",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Terms &amp; Conditions</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            User Agreement &amp; Terms of Use
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            Official purchasing rules, platform guidelines, intellectual property terms, and legal user agreement for Shop Genuine.
          </p>
        </div>
      </section>

      {/* ── Main Policy Content ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Key Provisions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {keyTerms.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-pink-100 shadow-soft text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6" stroke={1.8} />
                  </div>
                  <h3 className="text-sm font-semibold text-noir">{item.title}</h3>
                  <p className="text-xs text-stone leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Main Document Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-line shadow-soft space-y-8 text-noir/80">
            {/* Intro */}
            <div className="border-b border-line pb-6">
              <p className="text-sm md:text-base leading-relaxed text-stone">
                Welcome to <strong className="text-noir font-semibold">Shop Genuine</strong>. By accessing our website, creating an account, or placing an order, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.
              </p>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                1. Acceptance of Terms &amp; Platform Use
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                These terms constitute a legal agreement between you and Shop Genuine. If you do not agree with any part of these terms, you must refrain from using the platform. Users must be at least 18 years of age or accessing the site under parental supervision.
              </p>
            </div>

            {/* Section 2: Products & Pricing */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                2. Product Availability, Pricing &amp; Payments
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li>All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
                <li>We reserve the right to modify prices, update product listings, or discontinue items without prior notice.</li>
                <li>In the event of a pricing error or technical glitch, Shop Genuine reserves the right to cancel affected orders and issue a full refund.</li>
              </ul>
            </div>

            {/* Section 3: Intellectual Property */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                3. Intellectual Property Rights
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                All content, brand logos, product photography, design elements, graphics, and text on this platform are the exclusive intellectual property of Shop Genuine. Unauthorized copying, reproduction, or redistribution is strictly prohibited.
              </p>
            </div>

            {/* Section 4: Limitation of Liability */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                4. Limitation of Liability &amp; Governing Law
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                Shop Genuine shall not be liable for indirect, incidental, or consequential damages resulting from platform usage or courier transit delays. These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Gurugram, Haryana</strong>.
              </p>
            </div>

            {/* Contact Support */}
            <div className="pt-6 border-t border-line bg-pink-50/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-noir text-base flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-pink" />
                  Legal &amp; Support Inquiries
                </h3>
                <p className="text-xs text-stone">
                  Shop Genuine, 89/2 Sector 39, Gurugram, Haryana.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-noir pt-2">
                  <a href="mailto:connect.genuinenutrition@gmail.com" className="text-pink hover:underline flex items-center gap-1">
                    connect.genuinenutrition@gmail.com
                  </a>
                  <span>•</span>
                  <a href="tel:+918053210008" className="hover:text-pink flex items-center gap-1">
                    +91 80532 10008
                  </a>
                </div>
              </div>

              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:scale-105 transition-all shrink-0 shadow-pink"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
