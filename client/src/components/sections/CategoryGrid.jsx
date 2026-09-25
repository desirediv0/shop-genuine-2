"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import { IconArrowRight } from "@tabler/icons-react";

/* Rotating pastel tints so each tile reads distinctly on a white page */
const TINTS = [
  { bg: "#FCE7F0", ring: "#F97316" },
  { bg: "#EEF3FC", ring: "#1D4ED8" },
  { bg: "#FFF4EC", ring: "#F97316" },
  { bg: "#F4FAEA", ring: "#8DC63F" },
  { bg: "#FBEFF7", ring: "#D95E08" },
  { bg: "#EDF6FB", ring: "#3B82F6" },
];

const CategoryTile = ({ category, index }) => {
  const tint = TINTS[index % TINTS.length];
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div className="flex flex-col items-center text-center">
        {/* Circular image well */}
        <div
          className="relative w-full aspect-square rounded-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5"
          style={{
            backgroundColor: tint.bg,
            boxShadow: "0 4px 16px rgba(42,42,53,0.06)",
          }}
        >
          <span
            className="absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-300 z-10 pointer-events-none group-hover:border-[color:var(--tint)]"
            style={{ "--tint": tint.ring }}
          />
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name || "Category"}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 15vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center font-display text-4xl sm:text-5xl font-bold select-none"
              style={{ color: tint.ring, opacity: 0.35 }}
            >
              {category.name?.charAt(0)?.toUpperCase() || "C"}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-[13px] sm:text-sm font-semibold text-noir capitalize leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-pink">
          {category.name}
        </h3>
        {productCount > 0 && (
          <p className="text-[11px] text-stone mt-0.5">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </Link>
  );
};

const SkeletonLoader = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex flex-col items-center">
        <div className="w-full aspect-square rounded-full bg-ivory-deep animate-pulse" />
        <div className="mt-3 h-3.5 w-20 rounded-full bg-ivory-deep animate-pulse" />
      </div>
    ))}
  </div>
);

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi("/public/categories");
        if (response.success && response.data?.categories) {
          setCategories(sortCategories(response.data.categories));
        } else {
          setError(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader />
        </div>
      </section>
    );
  }

  if (error || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="luxe-eyebrow">Shop by Category</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-[34px] text-noir leading-tight mt-1.5">
                Find your <span className="text-gradient">beauty essentials</span>
              </h2>
              <p className="text-sm text-stone mt-2 max-w-lg">
                Makeup, skincare, haircare and more — curated from brands you can trust.
              </p>
            </div>

            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-pink hover:gap-2.5 transition-all duration-300 shrink-0 pb-1"
            >
              View All
              <IconArrowRight className="h-4 w-4" stroke={2} />
            </Link>
          </div>
        </Reveal>

        {/* Category tiles */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 lg:gap-7">
            {categories.slice(0, 12).map((category, index) => (
              <CategoryTile key={category.id} category={category} index={index} />
            ))}
          </div>
        </Reveal>

        {/* View all — mobile */}
        <div className="mt-9 sm:hidden text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-pink text-sm font-semibold text-pink hover:bg-pink hover:text-white transition-colors duration-300"
          >
            View All Categories
            <IconArrowRight className="h-4 w-4" stroke={2} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
