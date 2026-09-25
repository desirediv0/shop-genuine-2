"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi, sortCategories } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        const cats = response.data?.categories || [];
        setCategories(sortCategories(cats));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? containerRef.current.scrollLeft - scrollAmount
          : containerRef.current.scrollLeft + scrollAmount;
      containerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="w-full py-4 max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-2.5 w-14 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="w-full py-4 sm:py-5 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative group">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 shadow-md rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink hover:text-white border border-gray-200 text-gray-700 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Categories Container */}
        <div
          ref={containerRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide px-1 py-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 flex flex-col items-center group/item text-center transition-transform duration-200"
            >
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white border-2 border-gray-200 group-hover/item:border-pink group-hover/item:shadow-[0_8px_20px_rgba(249, 115, 22,0.15)] transition-all duration-300 p-2 flex items-center justify-center">
                {category.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-contain transition-transform duration-300 group-hover/item:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-50 rounded-xl text-pink font-bold text-base">
                    {category.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}

                {/* Product count badge */}
                {category._count?.products > 0 && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-pink text-white text-[10px] font-semibold rounded-full shadow-sm leading-none">
                    {category._count.products}
                  </div>
                )}
              </div>
              <span className="mt-2 text-xs sm:text-[13px] font-medium text-gray-700 group-hover/item:text-pink transition-colors line-clamp-1 max-w-[76px] sm:max-w-[90px] md:max-w-[100px]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 shadow-md rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink hover:text-white border border-gray-200 text-gray-700 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
