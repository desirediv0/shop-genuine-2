"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconHelpCircle, IconArrowRight } from "@tabler/icons-react";
import Reveal from "@/components/ui/Reveal";

const FAQ_ITEMS = [
  {
    question: "How do I select the best perfume for my personality?",
    answer: "You can use our interactive Fragrance Finder tool on the website or choose based on scent families (Floral, Woody, Oriental, Fresh). Our customer support is also available for personalized consultations."
  },
  {
    question: "Are Shop Genuine fragrances long-lasting?",
    answer: "Yes, all Shop Genuine perfumes are formulated as high-concentration Eau de Parfum (EDP) and Extrait de Parfum, ensuring exceptional longevity of 8 to 14+ hours on skin and fabrics."
  },
  {
    question: "How does the Custom Perfume service work?",
    answer: "Our Custom Perfume service allows you to craft your own unique scent signature. You select your preferred top, middle, and base notes, bottle customization, and bottle engraving, creating a one-of-a-kind perfume."
  },
  {
    question: "What is your shipping and delivery timeline?",
    answer: "We offer complimentary standard shipping across India on eligible orders. Orders are typically dispatched within 24-48 hours and delivered within 3-5 business days."
  },
  {
    question: "Do you offer Corporate Gifting and Bulk Orders?",
    answer: "Yes! We specialize in premium luxury corporate gifts, complete with customized co-branding, personalized greeting notes, and elegant gift boxes."
  }
];

export default function HomeFAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-12 md:py-16 bg-pink-50 border-t border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-9 md:mb-11">
            <span className="luxe-eyebrow">
              <IconHelpCircle className="w-3.5 h-3.5" stroke={2} />
              Got questions?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-[34px] text-noir leading-tight mt-1.5">
              Frequently asked <span className="text-gradient">questions</span>
            </h2>
            <p className="text-stone text-sm mt-2">
              Everything you need to know about our products and services
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} delay={idx * 0.05}>
                <div
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen ? "border-pink shadow-soft" : "border-line"
                    }`}
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 hover:bg-pink-50/60 transition-colors"
                  >
                    <span className="text-[15px] font-semibold text-noir">{item.question}</span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-pink text-white rotate-180" : "bg-pink-50 text-pink"
                        }`}
                    >
                      <IconChevronDown className="w-4 h-4" stroke={2.2} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-stone text-sm leading-relaxed border-t border-line pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="text-center mt-9">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 px-7 h-11 rounded-full bg-white border border-pink text-sm font-semibold text-pink hover:bg-pink hover:text-white transition-colors duration-300"
          >
            View All FAQs
            <IconArrowRight className="w-4 h-4" stroke={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
