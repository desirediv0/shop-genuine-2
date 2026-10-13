import HeroSectionStore from "@/components/sections/HeroSectionStore";
import CategoriesCarousel from "@/components/catgry";
import CategoryGrid from "@/components/sections/CategoryGrid";
import WatchAndBuySection from "@/components/sections/WatchAndBuySection";
import NewArrivals from "@/components/sections/NewArrivals";
import FragranceFinderSection from "@/components/sections/FragranceFinderSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import BrandCarousel from "@/components/sections/BrandCarousel";
import CustomPerfumeSection from "@/components/sections/CustomPerfumeSection";
import TrustBadgesSection from "@/components/sections/TrustBadgesSection";
import HomeFAQSection from "@/components/sections/HomeFAQSection";
import JoinTheCultSection from "@/components/sections/JoinTheCultSection";

export const metadata = {
  title: "Shop Genuine — Authentic Nutrition, Grocery, Pharmacy & Cosmetics",
  description:
    "Shop 100% authentic products at Shop Genuine — nutrition, grocery, pharmacy and cosmetics from the brands you love. Genuine products, honest prices, fast delivery across India.",
};

export default function Home() {
  return (
    <main>
      {/* 1. Banner */}
      <HeroSectionStore />

      {/* Categories Strip */}
      <CategoriesCarousel />

      {/* 2. Find Your Fragrance - Hidden */}
      {/* <FragranceFinderSection /> */}

      {/* 3. Shop By Collection - Hidden */}
      {/* <CategoryGrid /> */}

      {/* 4. Customised Perfume - Hidden */}
      {/* <CustomPerfumeSection /> */}

      {/* 5. Watch & Buy */}
      <WatchAndBuySection />

      {/* 6. New Arrivals */}
      <NewArrivals />

      {/* 7. Featured Products */}
      <FeaturedProducts />

      {/* 8. Shop By Brand */}
      <BrandCarousel title="Shop By Brand" />

      {/* 9. The Shop Genuine Promise */}
      <TrustBadgesSection />

      {/* 10. FAQ */}
      <HomeFAQSection />

      {/* 11. Join The Cult / Footer precedes */}
      <JoinTheCultSection />
    </main>
  );
}
