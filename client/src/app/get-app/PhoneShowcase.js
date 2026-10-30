"use client";

import { useEffect, useState } from "react";

const SHOTS = ["/app-1.jpeg", "/app-2.jpeg", "/app-3.jpeg"];

function Phone({ offset, tick, className = "" }) {
  return (
    <div className={`relative aspect-[9/19] h-full rounded-[1.6rem] bg-gray-900 p-[6px] shadow-2xl shadow-pink-500/30 ring-1 ring-white/30 ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[1.3rem] bg-white">
        {SHOTS.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt="Shop Genuine app screenshot"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${
              (tick + offset) % SHOTS.length === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function PhoneShowcase() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-[90%] items-center">
      <Phone offset={1} tick={tick} className="-mr-10 hidden h-[88%] -rotate-6 sm:block" />
      <Phone offset={0} tick={tick} className="z-10" />
      <Phone offset={2} tick={tick} className="-ml-10 hidden h-[88%] rotate-6 sm:block" />
    </div>
  );
}
