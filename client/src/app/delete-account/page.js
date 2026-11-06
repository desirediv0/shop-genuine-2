import Link from "next/link";
import { IconChevronRight, IconSparkles, IconTrash, IconMail, IconDeviceMobile } from "@tabler/icons-react";

export const metadata = {
  title: "Delete your account | Shop Genuine",
  description:
    "How to delete your Shop Genuine account and its personal data — in the app or by email — and what is deleted or kept.",
};

/*
 * Google Play requires a web page where people can ask for their account to be
 * deleted without the app (Play Console → Data safety → "Delete account URL"):
 * https://shopgenuine.online/delete-account. Keep the "deleted" and "kept" lists
 * in step with server/helper/deleteUserAccount.js — the page must describe what
 * deletion actually does.
 */
const SUPPORT_EMAIL = "connect.genuinenutrition@gmail.com";
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete my account")}`;

const card = "bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-soft space-y-3";
const h2 = "text-lg md:text-xl font-display font-semibold text-noir flex items-center gap-2.5";
const p = "text-xs sm:text-sm text-stone leading-relaxed";
const list = "space-y-2 text-xs sm:text-sm text-stone leading-relaxed";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Delete your account</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            Shop Genuine app &amp; website
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Delete your Shop Genuine account
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            You can delete your Shop Genuine account and its personal data at any time, in the app or by email.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className={card}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-white bg-[#F97316] rounded-full px-3 py-0.5">
              Fastest
            </span>
            <h2 className={h2}>
              <IconDeviceMobile className="w-5 h-5 text-pink" />
              In the app
            </h2>
            <ol className={`${list} list-decimal pl-5`}>
              <li>Open the <strong className="text-noir">Shop Genuine</strong> app and sign in.</li>
              <li>Go to <strong className="text-noir">Account</strong>.</li>
              <li>Tap <strong className="text-noir">Delete my account</strong> and confirm with your password.</li>
            </ol>
            <p className={p}>Your account is deleted straight away and you are signed out.</p>
          </div>

          <div className={card}>
            <h2 className={h2}>
              <IconMail className="w-5 h-5 text-pink" />
              Without the app
            </h2>
            <p className={p}>
              Email{" "}
              <a href={MAILTO} className="text-pink font-semibold underline">{SUPPORT_EMAIL}</a>{" "}
              from the email address you signed up with, with the subject{" "}
              <strong className="text-noir">&ldquo;Delete my account&rdquo;</strong>. We will delete the account and
              reply to confirm.
            </p>
          </div>

          <div className={card}>
            <h2 className={h2}>
              <IconTrash className="w-5 h-5 text-pink" />
              What is deleted
            </h2>
            <ul className={`${list} list-disc pl-5`}>
              <li>Your name, email address, phone number and password</li>
              <li>Your saved delivery addresses, except those your orders were delivered to</li>
              <li>Your cart, saved items (wishlist) and reviews</li>
              <li>Your coupons and notification settings for your devices</li>
            </ul>
          </div>

          <div className={card}>
            <h2 className={h2}>
              <span className="w-2 h-2 rounded-full bg-pink" />
              What is kept, and for how long
            </h2>
            <p className={p}>
              If you have placed orders, the order records — what was bought, the amounts, the payment status and the
              delivery address each order went to — are kept for as long as Indian tax and accounting laws require, and
              so that orders already placed can still be delivered. Your account&apos;s name, email address and phone
              number are removed, and the account can never be signed into again.
            </p>
            <p className={p}>If you never placed an order, nothing is kept.</p>
          </div>

          <p className="text-xs sm:text-sm text-stone text-center pt-2">
            Questions? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-pink font-semibold underline">{SUPPORT_EMAIL}</a>. See
            also our{" "}
            <Link href="/privacy-policy" className="text-pink font-semibold underline">privacy policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
