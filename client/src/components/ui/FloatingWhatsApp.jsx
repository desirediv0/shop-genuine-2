"use client";

import Image from "next/image";

export const FloatingWhatsApp = () => {
  const phoneNumber = "918053210008";
  const message = encodeURIComponent("Hi Shop Genuine, I'd like to know more about your products.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-16 md:bottom-5 right-4 md:right-5 z-40 group flex items-center justify-center w-14 h-14 rounded-full bg-white ring-1 ring-line shadow-[0_10px_28px_rgba(42,42,53,0.18)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full glow-pulse pointer-events-none" />
      <Image
        src="/whatsapp.png"
        alt="WhatsApp Icon"
        width={50}
        height={50}
        className="w-8 h-8 object-contain"
      />
    </a>
  );
};

export default FloatingWhatsApp;
