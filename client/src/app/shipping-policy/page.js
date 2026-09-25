import Link from "next/link";
import {
  IconTruck,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconAlertTriangle,
  IconMail,
  IconPhone,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";

export const metadata = {
  title: "Shipping & Delivery Policy | Shop Genuine",
  description: "Learn about Shop Genuine order processing timelines, delivery coverage, tracking updates, and free shipping terms across India.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Shipping Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            Dispatch & Delivery Timelines
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            Transparent timelines, nationwide coverage, secure tamper-evident packaging, and real-time tracking for every order.
          </p>
        </div>
      </section>

      {/* ── Main Policy Content ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink flex items-center justify-center mx-auto mb-3">
                <IconTruck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-noir mb-1">Free Shipping</h3>
              <p className="text-xs text-stone">On all orders above ₹499 across India</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink flex items-center justify-center mx-auto mb-3">
                <IconClock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-noir mb-1">Fast Dispatch</h3>
              <p className="text-xs text-stone">Processed &amp; dispatched in 24–48 hours</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink flex items-center justify-center mx-auto mb-3">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-noir mb-1">Safe Delivery</h3>
              <p className="text-xs text-stone">Tamper-evident protective packaging</p>
            </div>
          </div>

          {/* Main Document Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-line shadow-soft space-y-8 text-noir/80">
            {/* Intro */}
            <div className="border-b border-line pb-6">
              <p className="text-sm md:text-base leading-relaxed text-stone">
                At <strong className="text-noir font-semibold">Shop Genuine</strong>, we take great pride in ensuring that your authentic beauty products and luxury fragrances reach you quickly, safely, and in pristine condition. Below are our complete shipping policies and operational guidelines.
              </p>
            </div>

            {/* Section 1: Order Processing */}
            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                1. Order Processing &amp; Dispatch
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li>All orders are verified and processed upon successful payment confirmation.</li>
                <li>Standard orders are dispatched within <strong>24 to 48 business hours</strong>.</li>
                <li>During festive sales, promotional campaigns, or peak holiday seasons, processing may take up to 2 business days.</li>
                <li>Orders placed on Sundays or national holidays are dispatched on the following business day.</li>
              </ul>
            </div>

            {/* Section 2: Delivery Timelines */}
            <div className="space-y-4 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                2. Estimated Delivery Timelines
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-pink block mb-1">Metro Cities</span>
                  <p className="text-sm font-semibold text-noir">3 – 5 Business Days</p>
                  <p className="text-[11px] text-stone mt-1">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata</p>
                </div>

                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-pink block mb-1">Tier 2 &amp; Tier 3 Cities</span>
                  <p className="text-sm font-semibold text-noir">5 – 7 Business Days</p>
                  <p className="text-[11px] text-stone mt-1">Major state capitals &amp; urban regional hubs</p>
                </div>

                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-pink block mb-1">Rest of India</span>
                  <p className="text-sm font-semibold text-noir">7 – 10 Business Days</p>
                  <p className="text-[11px] text-stone mt-1">Remote, island &amp; special pincode zones</p>
                </div>
              </div>
            </div>

            {/* Section 3: Shipping Charges */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                3. Shipping Charges
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li><strong className="text-noir">Free Shipping:</strong> Available on all orders with a total cart value of <strong>₹499 or more</strong>.</li>
                <li><strong className="text-noir">Standard Shipping Fee:</strong> A nominal shipping fee of <strong>₹49</strong> applies to orders below ₹499.</li>
                <li>All applicable shipping charges are clearly calculated and displayed at checkout before payment.</li>
              </ul>
            </div>

            {/* Section 4: Real-time Order Tracking */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                4. Real-Time Order Tracking
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                Once your order is handed over to our logistics partner (BlueDart, Delhivery, Expressbees), you will receive:
              </p>
              <ul className="space-y-1 text-xs sm:text-sm text-stone list-disc pl-5">
                <li>Dispatch notification email &amp; SMS</li>
                <li>Direct courier tracking link with Air Waybill (AWB) number</li>
                <li>Updates via WhatsApp (if opted in)</li>
              </ul>
            </div>

            {/* Section 5: Unexpected Delays */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <IconAlertTriangle className="w-5 h-5 text-amber-500" />
                5. Delivery Delays &amp; Exceptions
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                While we make every effort to deliver your package on time, delays may occasionally occur due to factors beyond our direct control:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-stone bg-pink-50/30 p-4 rounded-2xl border border-pink-100/60">
                <span>• Extreme weather conditions / heavy rainfall</span>
                <span>• Pincode lockdown or government restrictions</span>
                <span>• Incorrect or incomplete delivery address / landmark</span>
                <span>• Recipient phone unreachable during delivery attempt</span>
              </div>
            </div>

            {/* Contact Box */}
            <div className="pt-6 border-t border-line bg-gradient-to-r from-[#FFF5F9] to-[#FCE7F0] p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-noir text-base flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-pink" />
                  Need Shipping Assistance?
                </h3>
                <p className="text-xs text-stone">
                  Our customer care team is available Monday – Saturday, 10:00 AM – 6:00 PM IST.
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
