"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconChevronDown,
  IconSparkles,
  IconHelpCircle,
  IconMail,
  IconPhone,
  IconTruck,
  IconShieldCheck,
  IconRefresh,
  IconCreditCard,
  IconChevronRight,
} from "@tabler/icons-react";

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "authenticity", label: "Products & Authenticity", icon: IconShieldCheck },
  { id: "shipping", label: "Orders & Shipping", icon: IconTruck },
  { id: "returns", label: "Returns & Replacements", icon: IconRefresh },
  { id: "payments", label: "Payments & COD", icon: IconCreditCard },
];

const DEFAULT_FAQS = [
  {
    id: 1,
    category: "authenticity",
    question: "Are all products on Shop Genuine 100% authentic?",
    answer:
      "Yes! Every product sold on Shop Genuine is 100% authentic, sourced directly from authorized brand distributors and official beauty houses. We strictly guarantee purity and original formulation.",
  },
  {
    id: 2,
    category: "shipping",
    question: "How long does shipping and delivery take?",
    answer:
      "Standard orders are dispatched within 24–48 hours. Metro cities receive packages within 3–5 business days, while Tier 2/3 cities and other regions take 5–7 business days. Orders above ₹499 qualify for Free Shipping.",
  },
  {
    id: 3,
    category: "shipping",
    question: "How can I track my order once shipped?",
    answer:
      "As soon as your order is dispatched, you will receive an SMS, email, and WhatsApp notification containing your direct courier tracking link and AWB tracking number.",
  },
  {
    id: 4,
    category: "returns",
    question: "What is the return and replacement policy?",
    answer:
      "Due to personal care hygiene standards, opened or used cosmetics and fragrances are non-returnable. However, if your package arrives damaged, defective, or incorrect, we provide a 100% free replacement within 24–48 hours upon providing a continuous unboxing video.",
  },
  {
    id: 5,
    category: "returns",
    question: "Why is an unboxing video mandatory for damage claims?",
    answer:
      "To protect against transit fraud and verify damaged or missing items accurately, a continuous, unedited unboxing video starting before opening the sealed outer courier bag is required by our courier partners for insurance claims.",
  },
  {
    id: 6,
    category: "payments",
    question: "What payment options do you support?",
    answer:
      "We accept all major Credit Cards, Debit Cards, Net Banking, UPI payments (Google Pay, PhonePe, Paytm, BHIM), and Cash on Delivery (COD) across eligible PIN codes.",
  },
  {
    id: 7,
    category: "payments",
    question: "Is Cash on Delivery (COD) available for all orders?",
    answer:
      "Yes, Cash on Delivery is available on most serviceable pincodes across India for standard orders. Complete order value must be paid to the courier agent upon delivery.",
  },
  {
    id: 8,
    category: "authenticity",
    question: "How should I store my luxury fragrances and skincare?",
    answer:
      "Store your perfumes and cosmetics in a cool, dry place away from direct sunlight, extreme heat, or humidity (avoid keeping them in bathrooms). This preserves the top notes and formulation longevity.",
  },
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(1);

  const filteredFaqs = useMemo(() => {
    return DEFAULT_FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  const toggleAccordion = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── Page Hero Header ── */}
      <section className="relative py-14 md:py-20 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">FAQs</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-pink-300" />
            Help &amp; Support Center
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto">
            Find instant answers to common queries regarding products, authenticity, shipping, returns, and payment options.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mt-8">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for questions (e.g. shipping, returns, authenticity, COD)..."
              className="w-full h-13 pl-12 pr-6 rounded-full bg-white text-noir text-sm outline-none shadow-lg placeholder:text-stone/70 border border-transparent focus:border-pink transition-all"
            />
          </div>
        </div>
      </section>

      {/* ── FAQs Content ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {FAQ_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white shadow-pink scale-105"
                      : "bg-white text-stone border border-pink-100 hover:border-pink hover:text-pink shadow-sm"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "border-pink shadow-soft"
                        : "border-line hover:border-pink/40"
                    }`}
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-medium text-noir hover:text-pink transition-colors"
                    >
                      <span className="text-base sm:text-lg font-semibold leading-snug">
                        {faq.question}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                          isOpen
                            ? "bg-pink text-white rotate-180"
                            : "bg-pink-50 text-pink"
                        }`}
                      >
                        <IconChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone leading-relaxed border-t border-pink-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-line shadow-soft space-y-4">
              <IconHelpCircle className="w-12 h-12 text-pink mx-auto opacity-50" />
              <h3 className="text-lg font-semibold text-noir">No matching questions found</h3>
              <p className="text-xs sm:text-sm text-stone max-w-md mx-auto">
                We couldn&apos;t find any answers matching &ldquo;{searchQuery}&rdquo;. Try using different keywords or contact our support team.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 text-pink text-xs font-semibold hover:bg-pink-100 transition-colors"
              >
                View All FAQs
              </button>
            </div>
          )}

          {/* Contact Support Card */}
          <div className="bg-gradient-to-r from-[#FFF5F9] to-[#FCE7F0] p-8 sm:p-10 rounded-3xl border border-pink-200 text-center space-y-4">
            <h3 className="text-xl font-display font-semibold text-noir">Still Have Questions?</h3>
            <p className="text-xs sm:text-sm text-stone max-w-lg mx-auto">
              Our beauty support team is available Monday to Saturday (10:00 AM – 6:00 PM IST) to assist with product choices, order tracking, and queries.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="mailto:connect.genuinenutrition@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white text-xs font-semibold uppercase tracking-wider shadow-pink hover:scale-105 transition-all"
              >
                <IconMail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="tel:+918053210008"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-pink-200 text-noir hover:text-pink text-xs font-semibold uppercase tracking-wider hover:border-pink transition-all"
              >
                <IconPhone className="w-4 h-4" />
                +91 80532 10008
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
