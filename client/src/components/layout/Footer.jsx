"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconShieldCheck,
  IconTruckDelivery,
  IconRefresh,
  IconHeadset,
} from "@tabler/icons-react";

const WHATSAPP_NUMBER = "918053210008";

const USPS = [
  { icon: IconShieldCheck, title: "100% Authentic", copy: "Sourced from official brands" },
  { icon: IconTruckDelivery, title: "Fast Delivery", copy: "Dispatched in 24–48 hours" },
  { icon: IconRefresh, title: "Easy Returns", copy: "Hassle-free return policy" },
  { icon: IconHeadset, title: "Customer Support", copy: "Expert help, 7 days a week" },
];

const SOCIALS = [
  { href: "https://www.instagram.com/", label: "Instagram", Icon: IconBrandInstagram },
  { href: "https://www.facebook.com/", label: "Facebook", Icon: IconBrandFacebook },
  { href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp", Icon: IconBrandWhatsapp },
];

export const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories((res.data?.categories || []).slice(0, 6)))
      .catch(console.error);
  }, []);

  const shopLinks =
    categories.length > 0
      ? [
        ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
        { label: "Secret Collection", href: "/secret-collection" },
      ]
      : [
        { label: "All Products", href: "/products" },
        // { label: "Combos & Bundles", href: "/bundles" },
        { label: "Gift Sets", href: "/products" },
        { label: "Secret Collection", href: "/secret-collection" },
      ];

  return (
    <footer className="relative bg-white">
      {/* ── USP strip ── */}
      <div className="border-y border-line" style={{ background: "linear-gradient(135deg,#FFF5F9 0%,#FCE7F0 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {USPS.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex items-center gap-3">
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white"
                  style={{ boxShadow: "0 4px 14px rgba(249, 115, 22,0.14)" }}
                >
                  <Icon className="h-5 w-5 text-pink" stroke={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] sm:text-sm font-semibold text-noir leading-tight">{title}</p>
                  <p className="text-[11px] sm:text-xs text-stone leading-tight mt-0.5">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer ── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <Link href="/" className="inline-block mb-5">
                <Image
                  src="/logo.png"
                  alt="Shop Genuine"
                  width={190}
                  height={62}
                  className="h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-[13px] leading-relaxed text-stone mb-6 max-w-[260px]">
                Your destination for authentic nutrition, grocery, pharmacy and cosmetics —
                everything genuine, all in one place.
              </p>
              <div className="flex gap-2.5">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-line text-stone bg-white transition-all duration-300 hover:text-white hover:border-transparent hover:shadow-pink"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg,#F97316 0%,#FB923C 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" stroke={1.8} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <FooterColumn title="Shop">
              {shopLinks.map((item) => (
                <FooterLink key={item.label} href={item.href} className="capitalize">
                  {item.label}
                </FooterLink>
              ))}
            </FooterColumn>

            {/* Company */}
            <FooterColumn title="Company">
              {[
                { label: "About Us", href: "/about" },
                { label: "Journal", href: "/blog" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <FooterLink key={label} href={href}>
                  {label}
                </FooterLink>
              ))}
            </FooterColumn>

            {/* Help */}
            <FooterColumn title="Customer Care">
              {[
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Return Policy", href: "/return-policy" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "FAQs", href: "/faqs" },
              ].map(({ label, href }) => (
                <FooterLink key={label} href={href}>
                  {label}
                </FooterLink>
              ))}
            </FooterColumn>

            {/* Contact */}
            <FooterColumn title="Get in Touch">
              <li>
                <a
                  href="tel:+918053210008"
                  className="flex items-center gap-2.5 text-[13px] text-stone hover:text-pink transition-colors"
                >
                  <IconPhone className="h-4 w-4 flex-shrink-0 text-pink" stroke={1.8} />
                  <span>+91 80532 10008</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:connect.genuinenutrition@gmail.com"
                  className="flex items-start gap-2.5 text-[13px] text-stone hover:text-pink transition-colors"
                >
                  <IconMail className="h-4 w-4 flex-shrink-0 mt-0.5 text-pink" stroke={1.8} />
                  <span className="break-all">connect.genuinenutrition@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-[13px] text-stone">
                  <IconMapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-pink" stroke={1.8} />
                  <span>89/2 Sector 39, Gurugram, Haryana</span>
                </div>
              </li>
            </FooterColumn>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-line bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone text-center md:text-left">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-noir">Shop Genuine</span> — All rights reserved
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-stone mr-1">We Accept</span>
              {[
                { name: "Visa", src: "/visa.png" },
                { name: "Mastercard", src: "/mc.png" },
                { name: "UPI", src: "/upi.png" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="px-2.5 py-1.5 bg-white rounded-lg border border-line flex items-center justify-center h-8 min-w-[44px] transition-all duration-300 hover:border-pink hover:shadow-soft"
                  title={item.name}
                >
                  <img src={item.src} alt={item.name} className="h-4 w-auto object-contain max-w-[34px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-noir mb-4 relative inline-block">
        {title}
        <span className="absolute -bottom-1.5 left-0 h-[3px] w-7 rounded-full bg-pink" />
      </h4>
      <ul className="space-y-2.5 mt-4">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, className = "" }) {
  return (
    <li>
      <Link
        href={href}
        className={`text-[13px] text-stone hover:text-pink transition-colors duration-300 inline-flex items-center gap-1.5 group ${className}`}
      >
        <span className="block h-px w-0 bg-pink transition-all duration-300 group-hover:w-3" />
        {children}
      </Link>
    </li>
  );
}

export default Footer;
