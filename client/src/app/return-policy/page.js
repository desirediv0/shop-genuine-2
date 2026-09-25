import Link from "next/link";
import {
  IconRefresh,
  IconVideo,
  IconShieldAlert,
  IconMail,
  IconPhone,
  IconChevronRight,
  IconCheck,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";

export const metadata = {
  title: "Return & Replacement Policy | Shop Genuine",
  description: "Review Shop Genuine Return & Replacement Policy, mandatory unboxing video requirements, replacement eligibility, and refund terms.",
};

const claimSteps = [
  {
    step: "01",
    title: "Record Unboxing Video",
    desc: "Record a continuous, uncut unboxing video starting before opening the outer shipping package.",
  },
  {
    step: "02",
    title: "Report Within 24-48 Hours",
    desc: "Send video & order details to connect.genuinenutrition@gmail.com or WhatsApp.",
  },
  {
    step: "03",
    title: "Quality Verification",
    desc: "Our quality team verifies transit damage, manufacturing defect, or wrong item claims.",
  },
  {
    step: "04",
    title: "Fast Replacement",
    desc: "Approved replacement is dispatched immediately with free doorstep delivery.",
  },
];

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Return Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            Hassle-Free Replacement Guidelines
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Return &amp; Replacement Policy
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            Our hygiene standards, claim procedure, unboxing video requirements, and customer-first replacement commitments.
          </p>
        </div>
      </section>

      {/* ── Main Policy Content ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 4-Step Claim Workflow */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-line shadow-soft">
            <h2 className="text-xl font-display font-semibold text-noir mb-8 text-center flex items-center justify-center gap-2">
              <IconRefresh className="w-5 h-5 text-pink" />
              Easy 4-Step Claim Procedure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {claimSteps.map((item) => (
                <div key={item.step} className="text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-50 text-pink border border-pink-100 rounded-2xl flex items-center justify-center mx-auto font-display font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-noir">{item.title}</h3>
                  <p className="text-xs text-stone leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Document Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-line shadow-soft space-y-8 text-noir/80">
            {/* Intro */}
            <div className="border-b border-line pb-6">
              <p className="text-sm md:text-base leading-relaxed text-stone">
                At <strong className="text-noir font-semibold">Shop Genuine</strong>, every cosmetics &amp; fragrance product is carefully formulated, sealed, and inspected for quality before dispatch. Due to strict personal care hygiene standards and product safety considerations, we follow a defined Returns &amp; Replacement Policy.
              </p>
            </div>

            {/* Non-Returnable Hygiene Policy */}
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                1. Hygiene &amp; Non-Returnable Policy
              </h2>
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                For health, safety, and hygiene reasons, opened, unsealed, or used cosmetic and fragrance items are <strong>non-returnable</strong> once delivered.
              </div>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                We do not accept returns or exchanges for:
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-stone">
                <div className="flex items-center gap-2 p-3 bg-pink-50/30 rounded-xl border border-pink-100/50">
                  <IconX className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Personal fragrance preference or change of mind</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-pink-50/30 rounded-xl border border-pink-100/50">
                  <IconX className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Opened, tested, or partially consumed products</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-pink-50/30 rounded-xl border border-pink-100/50">
                  <IconX className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Incorrect shade / product selected during checkout</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-pink-50/30 rounded-xl border border-pink-100/50">
                  <IconX className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Items purchased during clearance or flash sales</span>
                </div>
              </div>
            </div>

            {/* Eligible Replacements */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <IconCheck className="w-5 h-5 text-emerald-600" />
                2. Eligible Replacement Conditions
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                We provide a <strong className="text-noir">100% Free Replacement</strong> under the following conditions:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li>Package arrived damaged or leaked during transit</li>
                <li>Product bottle, cap, or pump spray mechanism is defective</li>
                <li>An incorrect product or variant was delivered</li>
                <li>Items missing from the ordered parcel</li>
              </ul>
              <p className="text-xs text-pink font-semibold pt-1">
                Note: All replacement claims must be reported within 24 to 48 hours of package delivery.
              </p>
            </div>

            {/* Mandatory Unboxing Video Box */}
            <div className="p-6 bg-gradient-to-r from-[#FFF5F9] to-[#FCE7F0] border border-pink-200/80 rounded-3xl space-y-3">
              <h3 className="text-base font-semibold text-noir flex items-center gap-2">
                <IconVideo className="w-5 h-5 text-pink" />
                Mandatory Unboxing Video Requirement
              </h3>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                To protect against fraudulent claims, a continuous, unedited unboxing video is required for all damage, leakage, or missing item claims.
              </p>
              <ul className="space-y-1.5 text-xs text-stone list-disc pl-5">
                <li>Video must start <strong>before opening</strong> the outer courier bag/box.</li>
                <li>Show the shipping label with tracking number clearly.</li>
                <li>Continue recording without cuts, pauses, or camera angles shifting away.</li>
                <li>Clearly show the defect, damage, or missing item on camera.</li>
              </ul>
              <p className="text-xs text-noir font-semibold pt-1">
                Claims submitted without an unboxing video cannot be processed.
              </p>
            </div>

            {/* Refund Policy */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                3. Refund Policy
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                If an approved replacement item is out of stock or cannot be fulfilled, a full refund will be initiated to your original payment method within <strong>5 to 7 business days</strong>.
              </p>
            </div>

            {/* Contact Support */}
            <div className="pt-6 border-t border-line bg-pink-50/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-noir text-base flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-pink" />
                  Submit a Replacement Claim
                </h3>
                <p className="text-xs text-stone">
                  Email your order ID and unboxing video to our team for quick resolution.
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
                Contact Customer Care
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
