"use client";

import { useState } from "react";
import { IconMail, IconArrowRight, IconCheck, IconLoader2, IconGift } from "@tabler/icons-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

export default function JoinTheCultSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: trimmed }),
      });

      if (res?.success) {
        setSubscribed(true);
        toast.success("Welcome to the Cult! Check your inbox for exclusive updates.");
      } else {
        toast.error(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      toast.error(err?.data?.message || err?.message || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl px-6 sm:px-10 py-10 sm:py-14 text-center"
            style={{ background: "linear-gradient(135deg,#FFF5F9 0%,#FCE7F0 55%,#FFF4EC 100%)" }}
          >
            <span className="pointer-events-none absolute -top-20 -left-16 w-64 h-64 rounded-full bg-pink/10 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-tangerine/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold mb-4"
                style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
              >
                <IconGift className="w-3.5 h-3.5" stroke={2} />
                Beauty Insider
              </span>

              <h2 className="font-display text-2xl sm:text-3xl md:text-[36px] text-noir leading-tight mb-3">
                Get <span className="text-gradient">₹200 off</span> your first order
              </h2>

              <p className="text-stone text-sm md:text-base leading-relaxed mb-8">
                Join our list for early access to new launches, members-only offers and beauty
                tips from our experts. No spam, ever.
              </p>

              {subscribed ? (
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-white border border-pink rounded-2xl text-pink text-sm font-semibold shadow-soft">
                  <IconCheck className="w-5 h-5" stroke={2.5} />
                  You&apos;re in! Check your inbox for your welcome offer.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <div className="relative flex-1">
                    <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone" stroke={1.8} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full h-12 pl-12 pr-4 bg-white border border-line rounded-full text-sm text-noir placeholder:text-stone/70 outline-none transition-all duration-300 focus:border-pink focus:shadow-[0_0_0_4px_rgba(249, 115, 22,0.10)]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 rounded-full text-white text-sm font-semibold transition-all duration-300 hover:shadow-pink disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                    style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
                  >
                    {loading ? (
                      <>
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <IconArrowRight className="w-4 h-4" stroke={2} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
