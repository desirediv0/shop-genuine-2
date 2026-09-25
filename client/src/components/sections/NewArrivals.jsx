"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";
import { useStoreType } from "@/context/StoreTypeContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

// Skeleton loader
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse border border-line">
    <div className="aspect-square w-full bg-ivory-deep"></div>
    <div className="p-3.5">
      <div className="h-3 w-16 bg-ivory-deep rounded-full mb-2"></div>
      <div className="h-3.5 w-full bg-ivory-deep rounded mb-2"></div>
      <div className="h-3.5 w-3/4 bg-ivory-deep rounded mb-3"></div>
      <div className="h-9 w-full bg-ivory-deep rounded-full"></div>
    </div>
  </div>
);

const SectionHeader = () => (
  <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
    <div>
      <span className="luxe-eyebrow">
        <Sparkles className="w-3.5 h-3.5" />
        Just Arrived
      </span>
      <h2 className="font-display text-2xl sm:text-3xl md:text-[34px] text-noir leading-tight mt-1.5">
        New <span className="text-gradient">Arrivals</span>
      </h2>
      <p className="text-sm text-stone mt-1.5">Fresh launches added to the shelf this week</p>
    </div>
    <Link
      href="/products?productType=new"
      className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-pink hover:gap-2.5 transition-all duration-300 shrink-0 pb-1"
    >
      View All
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export const NewArrivals = () => {
  const { activeStoreType } = useStoreType();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);

  // Auto-scroll carousel every 2.5 seconds
  useEffect(() => {
    if (!api) return;

    const scrollInterval = setInterval(() => {
      api.scrollNext();
    }, 2500);

    return () => clearInterval(scrollInterval);
  }, [api]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const storeVerticalQuery = activeStoreType ? `&storeVerticalId=${activeStoreType}` : "";
        // Try new product type first
        let response = await fetchApi(`/public/products/type/new?limit=12${storeVerticalQuery}`);

        if (!response?.data?.products?.length) {
          // Fallback to recent products
          response = await fetchApi(`/public/products?sort=createdAt&order=desc&limit=12${storeVerticalQuery}`);
        }

        setProducts(response?.data?.products || []);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeStoreType]);

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {/* Products Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product, index) => (
                <CarouselItem
                  key={product.id || product.slug || index}
                  className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 py-2"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Controls */}
            <CarouselPrevious className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white border-line text-noir hover:bg-pink hover:text-white hover:border-pink shadow-card z-10" />
            <CarouselNext className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white border-line text-noir hover:bg-pink hover:text-white hover:border-pink shadow-card z-10" />
          </Carousel>
        </div>

        {/* View All Button — mobile */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/products?productType=new"
            className="inline-flex items-center gap-2 px-7 h-11 rounded-full border border-pink text-sm font-semibold text-pink bg-white hover:bg-pink hover:text-white transition-colors duration-300"
          >
            View All New Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
