import Link from "next/link";
import {
  IconLock,
  IconShieldCheck,
  IconEye,
  IconChevronRight,
  IconSparkles,
  IconMail,
} from "@tabler/icons-react";

export const metadata = {
  title: "Privacy Policy | Shop Genuine",
  description:
    "How Arvi Consumer Private Limited collects, uses, shares and protects your information on the Shop Genuine website and app.",
};

/*
 * This page is also the app's privacy policy: Google Play and the app link to
 * https://shopgenuine.online/privacy-policy (api.shopgenuine.online/privacy-policy
 * redirects here). Keep it true to what the website, the app and the server
 * actually do, and update it before anything new ships — a new courier, email
 * provider or host, or crash reporting (Sentry) being switched on in the app.
 */
const COMPANY = {
  name: "Arvi Consumer Private Limited",
  gstin: "06ABCCA6498E1ZK",
  address: "89/2 Sector 39, Gurugram, Haryana, India",
  email: "connect.genuinenutrition@gmail.com",
  phone: "+91 80532 10008",
  phoneHref: "tel:+918053210008",
  grievanceOfficer: "Rajat Gulia",
};
const LAST_UPDATED = "5 November 2026";

const securityPillars = [
  {
    icon: IconLock,
    title: "We never sell your data",
    desc: "Your details are used only to run your account and deliver your orders. No advertising, no tracking across other sites or apps.",
  },
  {
    icon: IconShieldCheck,
    title: "Encrypted connections",
    desc: "Everything between your browser or the app and our servers travels over HTTPS. Passwords are stored hashed.",
  },
  {
    icon: IconEye,
    title: "No card details stored",
    desc: "Online payments happen inside Razorpay's secure checkout. We never see your card, UPI or netbanking details.",
  },
];

/** Who receives what, and why — the companies needed to run the service. */
const recipients = [
  ["Shiprocket and the courier it assigns", "Name, delivery address, phone, what is in the parcel", "To deliver your order"],
  ["Razorpay", "Order amount, and the payment details you enter with them", "To take online payments"],
  ["Brevo", "Your email address and the email we send", "One-time codes and order emails"],
  ["Expo and Google (Firebase Cloud Messaging)", "Your push token and the notification text (app only)", "To deliver notifications"],
  ["Expo", "App version, platform, a random installation identifier (app only)", "To deliver app updates"],
  ["Hostinger", "Your account and order data", "Our servers run there"],
  ["DigitalOcean", "Product images", "Image storage"],
];

function Section({ number, title, children }) {
  return (
    <div className="space-y-3 pt-4 border-t border-line first:border-t-0 first:pt-0">
      <h2 className="text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-pink" />
        {number}. {title}
      </h2>
      {children}
    </div>
  );
}

const p = "text-xs sm:text-sm text-stone leading-relaxed";
const list = "space-y-2 text-xs sm:text-sm text-stone list-disc pl-5 leading-relaxed";
const mail = (
  <a href={`mailto:${COMPANY.email}`} className="text-pink font-semibold underline">
    {COMPANY.email}
  </a>
);

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
            Website &amp; App
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            What we collect on the Shop Genuine website and app, why, who receives it, and what you can do about it.
          </p>
          <p className="text-xs text-white/60 mt-3">Last updated: {LAST_UPDATED}</p>
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
                The Shop Genuine website (shopgenuine.online) and the Shop Genuine app for Android and iOS are operated by{" "}
                <strong className="text-noir font-semibold">{COMPANY.name}</strong> (GSTIN {COMPANY.gstin}), {COMPANY.address}
                {" "}(&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy follows the Information Technology Act, 2000, the Digital
                Personal Data Protection Act, 2023 and the Consumer Protection (E-Commerce) Rules, 2020.
              </p>
            </div>

            <Section number={1} title="What we collect">
              <ul className={list}>
                <li><strong className="text-noir">Your account:</strong> your name, email address, phone number (optional) and password. We email you a one-time code to confirm your address. Passwords are stored hashed, never as plain text.</li>
                <li><strong className="text-noir">Your orders:</strong> the delivery addresses you save, what you ordered, the amounts, how you paid and the status of each order.</li>
                <li><strong className="text-noir">Your cart and saved items.</strong> Before you sign in, your cart is kept only in your browser or on your phone, and is sent to us when you sign in.</li>
                <li><strong className="text-noir">In the app, if you allow notifications:</strong> a push token that lets us send order updates to your phone. The app works fully without it, and you can turn notifications off in your phone&apos;s settings at any time.</li>
                <li><strong className="text-noir">In the app, for updates:</strong> when the app starts it checks for updates. That request carries the app version, your phone&apos;s platform (Android or iOS) and a random installation identifier that is not linked to your account.</li>
                <li><strong className="text-noir">Technical information</strong> needed to answer each request, such as your IP address and browser or device type.</li>
              </ul>
            </Section>

            <Section number={2} title="What we do not collect">
              <ul className={list}>
                <li><strong className="text-noir">Card, UPI and netbanking details.</strong> Online payments are made inside Razorpay&apos;s own secure checkout. Those details go straight to Razorpay; we receive only a reference confirming the payment.</li>
                <li>Your location, contacts, photos, camera or microphone.</li>
              </ul>
              <p className={p}>We show no advertising, we use no analytics or advertising trackers, and we never sell your data.</p>
            </Section>

            <Section number={3} title="Cookies on the website">
              <p className={p}>
                The website uses a cookie and your browser&apos;s local storage only to keep you signed in and to remember your cart.
                It sets no advertising or analytics cookies. If you block cookies, signing in will not work.
              </p>
            </Section>

            <Section number={4} title="Why we use it">
              <ul className={list}>
                <li>To create and secure your account</li>
                <li>To take, ship, deliver and invoice your orders</li>
                <li>To tell you what is happening with an order</li>
                <li>To answer you when you contact us</li>
                <li>To meet legal obligations, such as keeping tax invoices</li>
              </ul>
            </Section>

            <Section number={5} title="Who receives it">
              <p className={p}>Only the companies we need to run the service, and only what each one needs:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-stone">
                  <thead>
                    <tr className="text-noir">
                      <th className="py-2 pr-3 font-semibold">Who</th>
                      <th className="py-2 pr-3 font-semibold">What</th>
                      <th className="py-2 font-semibold">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map(([who, what, why]) => (
                      <tr key={who} className="border-t border-line align-top">
                        <td className="py-2 pr-3 text-noir">{who}</td>
                        <td className="py-2 pr-3">{what}</td>
                        <td className="py-2">{why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={p}>We also disclose information when the law requires it.</p>
            </Section>

            <Section number={6} title="Where it is stored">
              <p className={p}>
                Your account and order data are stored on our servers in Mumbai, India, and product images in Bangalore, India.
                Expo, Google and Brevo process the limited data listed above on their own servers, which may be outside India,
                only to deliver notifications, app updates and emails.
              </p>
            </Section>

            <Section number={7} title="How long we keep it">
              <p className={p}>
                Your account details are kept while your account exists. Order records and invoices are kept for as long as
                Indian tax and accounting laws require, even after you delete your account.
              </p>
            </Section>

            <Section number={8} title="Your choices and rights">
              <ul className={list}>
                <li>
                  <strong className="text-noir">Delete your account in the app:</strong> Account → Delete my account. Your name,
                  email and phone are removed straight away. If you never placed an order, nothing is kept; if you did, the order
                  records are kept without your personal details, as described on our{" "}
                  <a href="https://api.shopgenuine.online/delete-account" className="text-pink font-semibold underline">account deletion page</a>.
                </li>
                <li>Edit or remove saved addresses, reset your password and turn notifications off yourself.</li>
                <li>To see, correct or delete anything else we hold about you, or to delete your account without the app, email {mail}.</li>
              </ul>
            </Section>

            <Section number={9} title="Children">
              <p className={p}>Shop Genuine is not meant for anyone under 18, and we do not knowingly collect data from children.</p>
            </Section>

            <Section number={10} title="Security">
              <p className={p}>
                Everything between your browser or the app and our servers travels encrypted (HTTPS). Passwords are stored hashed
                and payment gateway keys are stored encrypted. No system is perfectly secure, but we take reasonable steps to
                protect your information.
              </p>
            </Section>

            <Section number={11} title="Changes to this policy">
              <p className={p}>
                If we change this policy we will update the date at the top, and tell you on the website or in the app when a
                change is significant.
              </p>
            </Section>

            {/* Grievance Officer */}
            <div className="pt-6 border-t border-line bg-pink-50/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-noir text-base flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-pink" />
                  Grievance Officer
                </h3>
                <p className="text-sm text-noir">
                  <strong>{COMPANY.grievanceOfficer}</strong>, {COMPANY.name}
                </p>
                <p className="text-xs text-stone">{COMPANY.address}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-noir pt-2">
                  <a href={`mailto:${COMPANY.email}`} className="text-pink hover:underline flex items-center gap-1">
                    {COMPANY.email}
                  </a>
                  <span>•</span>
                  <a href={COMPANY.phoneHref} className="hover:text-pink flex items-center gap-1">
                    {COMPANY.phone} (Mon–Sat, 10am–7pm)
                  </a>
                </div>
                <p className="text-xs text-stone pt-2">
                  We acknowledge every complaint within 48 hours and resolve it within one month.
                </p>
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
