"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconMail,
  IconSend,
  IconLoader2,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconChevronDown,
  IconBrandWhatsapp,
  IconPhone,
  IconBuildingStore,
  IconArrowUpRight,
  IconSparkles,
  IconCheck,
  IconHelpCircle,
} from "@tabler/icons-react";
import Image from "next/image";

/* ─── FAQ Data ──────────────────────────────────────────── */
const contactFaqs = [
  {
    question: "What are your customer support hours?",
    answer:
      "Our customer support team is active Monday through Saturday from 10:00 AM to 7:00 PM IST. Messages received after business hours or on Sundays are addressed promptly on the following business day.",
  },
  {
    question: "How do I track my existing order?",
    answer:
      "Once your order is dispatched, you will receive a tracking link via Email, SMS, and WhatsApp. You can also visit our Track Order page or reach out to us with your order number.",
  },
  {
    question: "How do I report a damaged or defective parcel?",
    answer:
      "Please record a continuous, unedited unboxing video starting before opening the sealed parcel and send it to connect.genuinenutrition@gmail.com or WhatsApp within 24–48 hours of delivery.",
  },
  {
    question: "Do you offer bulk or corporate orders?",
    answer:
      "Yes! For bulk gifting, event favors, or corporate inquiries, please select 'Collaboration' or 'General Inquiry' in the contact form or message us directly on WhatsApp.",
  },
];

export default function ContactPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetchApi("/content/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success(response.data?.message || "Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (error) {
      toast.error(error.message || "Failed to send message. Please try again or WhatsApp us directly.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5F9] via-white to-white pt-24 pb-20 font-sans">
      {/* ── HERO BANNER ── */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-r from-[#2A2A35] via-[#4A2478] to-[#F97316] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-pink-200 mb-6">
            <IconSparkles className="w-4 h-4 text-pink-300" />
            Get In Touch With Us
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            Contact <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FB923C] to-white">Shop Genuine</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether you need assistance with an order, product recommendations, or corporate inquiries — our support team is here for you.
          </p>
        </div>
      </section>

      {/* ── 4 QUICK CONTACT CARDS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Email */}
          <a
            href="mailto:connect.genuinenutrition@gmail.com"
            className="bg-white p-7 rounded-3xl border border-pink-100 shadow-soft hover:shadow-pink hover:border-pink/50 transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-pink-50 text-pink border border-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconMail className="w-6 h-6" stroke={1.8} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink mb-1">Email Support</span>
            <p className="text-xs sm:text-sm font-semibold text-noir break-all">connect.genuinenutrition@gmail.com</p>
            <span className="text-[11px] text-stone mt-2">24/7 Response Time</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/918053210008"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-7 rounded-3xl border border-pink-100 shadow-soft hover:shadow-pink hover:border-pink/50 transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconBrandWhatsapp className="w-6 h-6" stroke={1.8} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">WhatsApp Us</span>
            <p className="text-xs sm:text-sm font-semibold text-noir">+91 80532 10008</p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
              Instant Chat <IconArrowUpRight className="w-3 h-3" />
            </span>
          </a>

          {/* Phone */}
          <a
            href="tel:+918053210008"
            className="bg-white p-7 rounded-3xl border border-pink-100 shadow-soft hover:shadow-pink hover:border-pink/50 transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-pink-50 text-pink border border-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconPhone className="w-6 h-6" stroke={1.8} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink mb-1">Phone Line</span>
            <p className="text-xs sm:text-sm font-semibold text-noir">+91 80532 10008</p>
            <span className="text-[11px] text-stone mt-2">Mon – Sat (10am – 7pm)</span>
          </a>

          {/* Address */}
          <div className="bg-white p-7 rounded-3xl border border-pink-100 shadow-soft flex flex-col items-center text-center group">
            <div className="w-13 h-13 rounded-2xl bg-pink-50 text-pink border border-pink-100 flex items-center justify-center mb-4">
              <IconMapPin className="w-6 h-6" stroke={1.8} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink mb-1">Our Location</span>
            <p className="text-xs sm:text-sm font-semibold text-noir">89/2 Sector 39, Gurugram</p>
            <span className="text-[11px] text-stone mt-2">Haryana, India</span>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM & STUDIO INFORMATION ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-line shadow-soft space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.15em] text-pink font-semibold block mb-2">
                  Send A Message
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-light text-noir">
                  We&apos;d Love To <em className="italic text-pink font-normal">Hear</em> From You
                </h2>
                <p className="text-xs sm:text-sm text-stone mt-2">
                  Fill in the form below and our support team will get back to you within 24 business hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your Full Name"
                      className="w-full h-12 px-4 bg-pink-50/40 border border-line rounded-xl text-noir text-sm outline-none focus:bg-white focus:border-pink focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.10)] transition-all placeholder:text-stone/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 00000 00000"
                      className="w-full h-12 px-4 bg-pink-50/40 border border-line rounded-xl text-noir text-sm outline-none focus:bg-white focus:border-pink focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.10)] transition-all placeholder:text-stone/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 bg-pink-50/40 border border-line rounded-xl text-noir text-sm outline-none focus:bg-white focus:border-pink focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.10)] transition-all placeholder:text-stone/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-pink-50/40 border border-line rounded-xl text-noir text-sm outline-none appearance-none focus:bg-white focus:border-pink focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.10)] transition-all cursor-pointer"
                    >
                      <option>General Inquiry</option>
                      <option>Order Status &amp; Tracking</option>
                      <option>Product Advice</option>
                      <option>Return &amp; Replacement</option>
                      <option>Corporate &amp; Bulk Orders</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone">
                      <IconChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Write your message or order details here..."
                    className="w-full p-4 bg-pink-50/40 border border-line rounded-xl text-noir text-sm outline-none focus:bg-white focus:border-pink focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.10)] transition-all placeholder:text-stone/60 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-pink hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <IconSend className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Studio & Location Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Support Image Showcase */}
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-line shadow-xl bg-pink-50 group">
                <Image
                  src="/contact_concierge_beauty.png"
                  alt="Shop Genuine Support"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-300 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-1">
                    Customer Support
                  </span>
                  <p className="text-lg font-semibold">Shop Genuine</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-line shadow-soft space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.15em] text-pink font-semibold block mb-2">
                    Studio &amp; Office
                  </span>
                  <h3 className="text-2xl font-display font-semibold text-noir">
                    Shop Genuine Atelier
                  </h3>
                  <p className="text-xs text-stone mt-1 leading-relaxed">
                    Our corporate studio and customer fulfillment desk in Gurugram.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-stone">
                    <IconBuildingStore className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-noir block font-semibold mb-0.5">Corporate Headquarters</strong>
                      <span>89/2 Sector 39, Gurugram, Haryana – 122001, India</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-stone">
                    <IconClock className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-noir block font-semibold mb-0.5">Working Hours</strong>
                      <span>Monday – Saturday: 10:00 AM – 7:00 PM IST</span>
                      <span className="block text-[11px] text-stone/70">Sunday: Closed</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-stone">
                    <IconMail className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-noir block font-semibold mb-0.5">Official Contact Email</strong>
                      <a href="mailto:connect.genuinenutrition@gmail.com" className="text-pink font-semibold hover:underline">
                        connect.genuinenutrition@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Google Maps Button */}
                <div className="pt-4 border-t border-line">
                  <a
                    href="https://maps.google.com/?q=Gurugram+Sector+39"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-pink-50 text-pink border border-pink-100 rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-pink hover:text-white transition-all duration-300"
                  >
                    <IconMapPin className="w-4 h-4" />
                    Open Location In Google Maps
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="bg-gradient-to-r from-[#FFF5F9] to-[#FCE7F0] p-6 rounded-3xl border border-pink-100 space-y-3">
                <h4 className="text-sm font-semibold text-noir flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-pink" />
                  Shop Genuine Promise
                </h4>
                <ul className="space-y-1.5 text-xs text-stone list-disc pl-5 leading-relaxed">
                  <li>100% Authentic products guaranteed</li>
                  <li>Fast responses on WhatsApp and email</li>
                  <li>Safe nationwide delivery with tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-pink-50/20 to-white border-t border-line/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs uppercase tracking-[0.15em] text-pink font-semibold block">
              Quick Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-light text-noir">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {contactFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-pink shadow-soft" : "border-line hover:border-pink/40"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-noir hover:text-pink transition-colors text-base"
                  >
                    <span>{faq.question}</span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "bg-pink text-white rotate-180" : "bg-pink-50 text-pink"
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
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#F97316] to-[#FB923C] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-white">
              Instant Support
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light leading-tight">
              Prefer To Chat Directly On WhatsApp?
            </h2>

            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-normal">
              Get instant product advice, order status updates, or custom consultation on WhatsApp.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/918053210008"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-pink text-sm font-semibold tracking-wide shadow-lg hover:bg-pink-50 transition-all duration-300 hover:scale-105"
              >
                <IconBrandWhatsapp className="w-5 h-5 text-emerald-600" />
                Chat On WhatsApp
              </a>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-sm font-medium hover:bg-white/30 transition-all duration-300"
              >
                Shop Products <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
