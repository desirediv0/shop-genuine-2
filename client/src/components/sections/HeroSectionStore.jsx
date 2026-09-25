"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";

// Test hero assets: desk.PNG (1672x941 ~16:9) for desktop/tablet, mob.PNG (941x1672 ~9:16) for mobile
const LOCAL_FALLBACKS = [
  {
    id: "fallback-1",
    image: "/desk.PNG",
    tabletImage: "/desk.PNG",
    mobileImage: "/mob.PNG",
    title: "Beauty That Is Truly Genuine",
    subtitle: "Makeup, skincare and haircare from the brands you love \u2014 100% authentic, always.",
    link: "/products",
  },
  {
    id: "fallback-2",
    image: "/desk2.PNG",
    tabletImage: "/desk2.PNG",
    mobileImage: "/mob2.PNG",
    title: "Glow With Every Look",
    subtitle: "Discover bestsellers, new launches and everyday essentials curated just for you.",
    link: "/categories",
  },
];

function SkeletonLoader() {
  return (
    <div className="relative min-h-[380px] md:min-h-[480px] lg:min-h-[560px] bg-brand-mesh animate-pulse">
      <div className="absolute inset-0 flex items-center">
        <div className="px-6 md:px-16 space-y-5 w-full max-w-xl">
          <div className="h-6 w-32 bg-white/70 rounded-full" />
          <div className="h-10 w-72 bg-white/70 rounded-xl" />
          <div className="h-4 w-64 bg-white/60 rounded-lg" />
          <div className="h-11 w-40 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function HeroSectionStore() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const checkScreen = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
      setIsLaptop(w >= 1024 && w < 1440);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchApi("/public/banners")
      .then((res) => {
        const arr = res?.data?.banners;
        if (alive && Array.isArray(arr) && arr.length > 0) {
          const mapped = arr.map((b, i) => ({
            id: b._id || b.id || `banner-${i}`,
            image: b.image || b.imageUrl || "/desk.PNG",
            tabletImage: b.tabletImage || b.tabletImg || b.image || b.imageUrl || "/desk.PNG",
            mobileImage: b.mobileImage || b.mobileImg || b.image || b.imageUrl || "/mob.PNG",
            title: b.title || "Shop Genuine",
            subtitle: b.subtitle || "Authentic beauty, delivered to your door.",
            link: b.link || "/products",
          }));
          setBanners(mapped);
        } else if (alive) {
          setBanners(LOCAL_FALLBACKS);
        }
      })
      .catch(() => {
        if (alive) setBanners(LOCAL_FALLBACKS);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const goTo = useCallback(
    (idx) => {
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(next, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [banners.length, isPaused, next]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  if (loading) return <SkeletonLoader />;

  const current = banners[currentIndex];

  return (
    <section
      className="relative w-full bg-brand-mesh text-white overflow-hidden"
      style={{
        height: isMobile ? "420px" : isTablet ? "500px" : isLaptop ? "560px" : "620px",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Hero banner carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={
              isMobile
                ? current.mobileImage || "/hero-mobile.jpg"
                : (isTablet ? current.tabletImage || "/hero-tablet.jpg" : current.image || "/hero.jpg")
            }
            alt={current.title}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNGQ0U3RjAiLz48L3N2Zz4="
          />
          {/* Soft scrim keeps the copy readable without dulling the product shot */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A2A35]/65 via-[#2A2A35]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#D95E08]/25 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0 z-20 flex items-center"
        >
          <div className="w-full px-5 sm:px-10 md:px-16 lg:px-20 xl:px-24">
            <div className="max-w-[520px] sm:max-w-[620px] pointer-events-auto">
              <motion.div
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-3 md:mb-5"
              >
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
                >
                  <IconSparkles className="h-3.5 w-3.5" stroke={2} />
                  100% Authentic Beauty
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-display font-bold leading-[1.1] mb-3 sm:mb-4 md:mb-5 text-white"
                style={{
                  fontSize: isMobile ? "28px" : isTablet ? "42px" : isLaptop ? "52px" : "60px",
                }}
              >
                {current.title.split(" ").length > 3 ? (
                  <>
                    {current.title
                      .split(" ")
                      .slice(0, Math.ceil(current.title.split(" ").length / 2))
                      .join(" ")}{" "}
                    <span className="text-gradient-light">
                      {current.title
                        .split(" ")
                        .slice(Math.ceil(current.title.split(" ").length / 2))
                        .join(" ")}
                    </span>
                  </>
                ) : (
                  current.title
                )}
              </motion.h1>

              <motion.p
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="leading-relaxed mb-6 sm:mb-8 text-white/85 max-w-[500px]"
                style={{
                  fontSize: isMobile ? "13px" : isTablet ? "15px" : "17px",
                }}
              >
                {current.subtitle}
              </motion.p>

              <motion.div
                custom={3}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-row flex-wrap gap-2.5 sm:gap-3"
              >
                <button
                  onClick={() => router.push(current.link || "/products")}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-8 rounded-full text-white text-[12px] sm:text-sm font-semibold transition-all duration-300 hover:shadow-pink active:scale-[0.98]"
                  style={{
                    height: isMobile ? "40px" : "50px",
                    background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)",
                  }}
                >
                  Shop Now
                  <IconArrowRight className="h-4 w-4" stroke={2} />
                </button>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-8 rounded-full bg-white/95 text-noir text-[12px] sm:text-sm font-semibold transition-all duration-300 hover:bg-white hover:text-pink active:scale-[0.98]"
                  style={{ height: isMobile ? "40px" : "50px" }}
                >
                  Browse Categories
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 hidden sm:flex items-center justify-center rounded-full bg-white/90 text-noir shadow-[0_4px_16px_rgba(42,42,53,0.18)] hover:bg-white hover:text-pink hover:scale-105 transition-all duration-300"
            aria-label="Previous banner"
          >
            <IconChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" stroke={2} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 hidden sm:flex items-center justify-center rounded-full bg-white/90 text-noir shadow-[0_4px_16px_rgba(42,42,53,0.18)] hover:bg-white hover:text-pink hover:scale-105 transition-all duration-300"
            aria-label="Next banner"
          >
            <IconChevronRight className="h-5 w-5 sm:h-6 sm:w-6" stroke={2} />
          </button>

          <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${i === currentIndex
                  ? "w-7 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
