import Link from "next/link";
import {
  IconLock,
  IconShieldCheck,
  IconEye,
  IconChevronRight,
  IconSparkles,
  IconMail,
  IconPhone,
  IconFileText,
} from "@tabler/icons-react";

export const metadata = {
  title: "Privacy Policy | Shop Genuine",
  description: "Learn how Shop Genuine protects your account details, secure payment credentials, and personal information in compliance with Indian IT regulations.",
};

const securityPillars = [
  {
    icon: IconLock,
    title: "Data Confidentiality",
    desc: "Your contact details, preferences, and order history are kept strictly confidential. We never sell customer data.",
  },
  {
    icon: IconShieldCheck,
    title: "256-Bit SSL Encryption",
    desc: "All transactions and sessions are encrypted using industry-standard 256-bit SSL protocols.",
  },
  {
    icon: IconEye,
    title: "Zero Card Storage",
    desc: "We do not store your credit card, debit card, or UPI PIN credentials on our servers.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Privacy Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            Data Protection &amp; Security Standards
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            How Shop Genuine collects, protects, uses, and safeguards your account and transactional information.
          </p>
        </div>
      </section>

      {/* ── Main Policy Content ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Security Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {securityPillars.map((item, idx) => {
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
                At <strong className="text-noir font-semibold">Shop Genuine</strong>, we are committed to respecting your privacy and protecting your personal data in accordance with the <em>Information Technology Act, 2000</em> and applicable e-commerce data privacy regulations in India.
              </p>
            </div>

            {/* Section 1: Information Collected */}
            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                1. Information We Collect
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                When you create an account, browse our store, or place an order, we collect:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li><strong className="text-noir">Personal Contact Details:</strong> Full name, email address, mobile number, delivery address, and billing address.</li>
                <li><strong className="text-noir">Account Credentials:</strong> Encrypted password tokens and user session data.</li>
                <li><strong className="text-noir">Transactional Records:</strong> Order history, invoice details, cart items, and wishlist selections.</li>
                <li><strong className="text-noir">Technical Logs:</strong> IP address, device type, browser version, and session cookies to prevent fraud.</li>
              </ul>
            </div>

            {/* Section 2: How We Use Data */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                2. How We Use Your Information
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                Your data is processed strictly for essential operational purposes:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed">
                <li>To process, fulfill, and dispatch your orders efficiently.</li>
                <li>To share shipping information with verified courier partners (BlueDart, Delhivery, Shiprocket) for delivery.</li>
                <li>To send order confirmation receipts, tracking updates, and account security notifications.</li>
                <li>To respond to customer support inquiries and replacement requests.</li>
              </ul>
            </div>

            {/* Section 3: Payment Security */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <IconShieldCheck className="w-5 h-5 text-emerald-600" />
                3. Payment Gateway Security
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                All online payments on Shop Genuine are processed via PCI-DSS compliant secure payment gateway providers (Razorpay, PhonePe).
              </p>
              <div className="p-4 bg-pink-50/40 border border-pink-100 rounded-2xl text-xs text-stone leading-relaxed">
                <strong>Shop Genuine does not store or access your credit/debit card numbers, CVV, NetBanking passwords, or UPI PINs.</strong> All financial details are handled directly by PCI-certified payment infrastructure.
              </div>
            </div>

            {/* Section 4: Cookies & Tracking */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                4. Cookies &amp; Browser Analytics
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                We use secure HTTP-only cookies and local storage tokens to maintain your shopping cart, preserve your login session, and improve website navigation. You may disable cookies in your browser settings, though some shopping features may require cookies to function properly.
              </p>
            </div>

            {/* Section 5: Data Rights */}
            <div className="space-y-3 pt-4 border-t border-line">
              <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink" />
                5. Your Data Rights &amp; Deletion Requests
              </h2>
              <p className="text-xs sm:text-sm text-stone leading-relaxed">
                You have the right to inspect, update, or request the deletion of your account and personal data from our database. To request account deletion or data export, please write to our Data Protection Team at <a href="mailto:connect.genuinenutrition@gmail.com" className="text-pink font-semibold underline">connect.genuinenutrition@gmail.com</a>.
              </p>
            </div>

            {/* Contact Support */}
            <div className="pt-6 border-t border-line bg-pink-50/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-noir text-base flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-pink" />
                  Privacy &amp; Data Officer
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
