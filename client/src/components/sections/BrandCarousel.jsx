"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { fetchApi } from "@/lib/utils";

export default function BrandCarousel({ tag, title = "Top Brands" }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const endpoint = tag ? `/public/brands-by-tag?tag=${encodeURIComponent(tag)}` : `/public/brands`;
        const res = await fetchApi(endpoint);
        const data = res.data?.brands || [];
        setBrands(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load brands:", err);
        setError("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [tag]);

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (!api || brands.length <= 4) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [api, brands.length]);

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-pink border-t-transparent animate-spin" />
            <span className="text-xs text-stone uppercase tracking-wider font-medium">
              Loading brands...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (error || !brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-[#FFF8FA] border-y border-[#FCE7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="luxe-eyebrow">
              <Sparkles className="w-3.5 h-3.5" />
              Official Partners
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-[32px] text-noir leading-tight mt-1.5">
              Shop By <span className="text-gradient">Brand</span>
            </h2>
            <p className="text-sm text-stone mt-1">
              100% authentic beauty brands sourced directly from official makers
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-pink hover:gap-2.5 transition-all duration-300 shrink-0 pb-1"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Brand Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {brands.map((brand) => {
              const imageUrl = brand.image?.startsWith("http")
                ? brand.image
                : `https://desirediv-storage.blr1.digitaloceanspaces.com/${brand.image}`;

              return (
                <CarouselItem
                  key={brand.id}
                  className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <Link
                    href={`/brand/${brand.slug}`}
                    className="block group p-4 bg-white rounded-2xl border border-line hover:border-pink/50 text-center transition-all duration-300 hover:shadow-[0_8px_24px_rgba(249, 115, 22,0.12)] hover:-translate-y-1"
                  >
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-3 flex items-center justify-center p-2">
                      {brand.image ? (
                        <Image
                          width={96}
                          height={96}
                          src={imageUrl}
                          alt={brand.name}
                          className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-pink-50 text-pink flex items-center justify-center font-bold text-lg">
                          {brand.name?.charAt(0)?.toUpperCase() || "B"}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-noir group-hover:text-pink transition-colors truncate">
                      {brand.name}
                    </p>
                    {brand.productCount !== undefined && (
                      <p className="text-[11px] text-stone mt-0.5">
                        {brand.productCount} {brand.productCount === 1 ? "Product" : "Products"}
                      </p>
                    )}
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-3 sm:-left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border-line text-noir shadow-md hover:bg-pink hover:text-white hover:border-pink transition-all" />
          <CarouselNext className="-right-3 sm:-right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border-line text-noir shadow-md hover:bg-pink hover:text-white hover:border-pink transition-all" />
        </Carousel>
      </div>
    </section>
  );
}
