"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, ShoppingBag, Check, Star, Search as IconSearch } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const calculateDiscountPercentage = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  if (value === 0) return 0;
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};

export const ProductCard = ({ product, viewMode = "grid" }) => {
  const isList = viewMode === "list";
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishlistItems, setWishlistItems] = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [priceSettings, setPriceSettings] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((res) => {
        const map = res.data?.wishlistItems?.reduce((acc, item) => {
          acc[item.productId] = true;
          return acc;
        }, {}) || {};
        setWishlistItems(map);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((res) => { if (res.success) setPriceSettings(res.data); })
      .catch(() => setPriceSettings({ hidePricesForGuests: false }));
  }, []);

  const getAllProductImages = useMemo(() => {
    const images = [];
    const imageUrls = new Set();
    const push = (raw) => {
      const url = raw?.url || raw;
      if (!url) return;
      const full = getImageUrl(url);
      if (!imageUrls.has(full)) { imageUrls.add(full); images.push(full); }
    };
    product.variants?.forEach((v) => v.images?.forEach(push));
    product.images?.forEach(push);
    if (images.length === 0 && product.image) push(product.image);
    if (images.length === 0) images.push("/placeholder.jpg");
    return images;
  }, [product]);

  useEffect(() => {
    if (!isHovered || getAllProductImages.length <= 1) { setCurrentImageIndex(0); return; }
    const t = setInterval(() => setCurrentImageIndex((p) => (p + 1) % getAllProductImages.length), 2000);
    return () => clearInterval(t);
  }, [isHovered, getAllProductImages.length]);

  const basePriceField = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField = parsePrice(product.price);
  const salePriceField = parsePrice(product.salePrice);

  const hasFlashSale = product.flashSale?.isActive === true;
  const flashSalePrice = hasFlashSale ? parsePrice(product.flashSale.flashSalePrice) : null;
  const flashSaleDiscountPercent = hasFlashSale ? product.flashSale.discountPercentage : 0;

  let hasSale = product.hasSale !== undefined && product.hasSale !== null ? Boolean(product.hasSale) : false;
  if (!hasSale && salePriceField !== null && salePriceField > 0) {
    if ((regularPriceField && salePriceField < regularPriceField) || (priceField && salePriceField < priceField))
      hasSale = true;
  }

  let originalPrice = null;
  let currentPrice = 0;
  if (basePriceField !== null && regularPriceField !== null) {
    currentPrice = basePriceField;
    originalPrice = hasSale && basePriceField < regularPriceField ? regularPriceField : null;
  } else if (salePriceField !== null && hasSale) {
    currentPrice = salePriceField;
    originalPrice = priceField || basePriceField || regularPriceField || null;
  } else {
    currentPrice = basePriceField || regularPriceField || priceField || salePriceField || 0;
  }
  if (!currentPrice || isNaN(currentPrice)) currentPrice = 0;

  let displayPrice = currentPrice;
  let showFlashSaleBadge = false;
  if (hasFlashSale && flashSalePrice !== null) {
    if (!originalPrice) originalPrice = currentPrice;
    displayPrice = flashSalePrice;
    showFlashSaleBadge = true;
  }

  const discountPercent = showFlashSaleBadge
    ? flashSaleDiscountPercent
    : hasSale && originalPrice && currentPrice
      ? calculateDiscountPercentage(originalPrice, currentPrice)
      : 0;

  const showPrice = !priceSettings?.hidePricesForGuests || isAuthenticated;
  const isOutOfStock = product.stock === 0 || product.inStock === false;
  const inWishlist = wishlistItems[product.id];

  const avgRating = parsePrice(product.avgRating) || 0;
  const reviewCount = product.reviewCount || 0;
  const brandName = product.brand?.name || product.category?.name || "";

  const handleAddToWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}`); return; }
    setIsAddingToWishlist((p) => ({ ...p, [product.id]: true }));
    try {
      if (inWishlist) {
        const res = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = res.data?.wishlistItems?.find((i) => i.productId === product.id);
        if (item) {
          await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" });
          setWishlistItems((p) => { const n = { ...p }; delete n[product.id]; return n; });
        }
      } else {
        await fetchApi("/users/wishlist", {
          method: "POST", credentials: "include",
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlistItems((p) => ({ ...p, [product.id]: true }));
      }
    } catch { toast.error("Failed to update wishlist"); }
    finally { setIsAddingToWishlist((p) => ({ ...p, [product.id]: false })); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!showPrice) {
      if (typeof openAuthModal === "function") openAuthModal();
      else toast.error("Please login to purchase items");
      return;
    }
    const variantId = product.variants?.[0]?.id;
    if (!variantId) {
      toast.error("Select options on product page");
      router.push(`/products/${product.slug}`);
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(variantId, 1);
      setAddedToCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) { console.error(err); }
    finally { setIsAddingToCart(false); }
  };

  const RatingRow = ({ compact = false }) =>
    avgRating > 0 ? (
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-white"
          style={{ backgroundColor: "#3D9A5B" }}
        >
          {avgRating.toFixed(1)}
          <Star className="w-2.5 h-2.5 fill-current" strokeWidth={0} />
        </span>
        {reviewCount > 0 && (
          <span className={cn("text-stone", compact ? "text-[11px]" : "text-[11px]")}>
            ({reviewCount})
          </span>
        )}
      </div>
    ) : null;

  /* ── LIST MODE ── */
  if (isList) {
    return (
      <div
        className="group relative bg-white overflow-hidden flex flex-row rounded-2xl border border-line transition-all duration-300 hover:border-pink/40 hover:shadow-card-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative flex-shrink-0 flex items-center justify-center overflow-hidden bg-pink-50"
          style={{ width: "170px", minHeight: "190px" }}
        >
          <Image
            src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            width={150}
            height={150}
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-3"
            style={{ width: "100%", height: "auto", maxHeight: "160px" }}
          />
          {discountPercent > 0 && (
            <span
              className="absolute top-2.5 left-2.5 text-[11px] font-bold text-white px-2 py-1 rounded-md"
              style={{ background: "linear-gradient(135deg,#F97316 0%,#F97316 100%)" }}
            >
              {discountPercent}% OFF
            </span>
          )}
        </Link>

        <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between min-w-0">
          <div>
            {brandName && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-pink">
                {brandName}
              </span>
            )}
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-[15px] font-medium text-noir mt-0.5 mb-1.5 line-clamp-2 hover:text-pink transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <RatingRow />
              {product.gender && (
                <span className="text-[11px] font-medium text-blueberry bg-blueberry-50 px-2 py-0.5 rounded-md capitalize">
                  {product.gender}
                </span>
              )}
            </div>

            {showPrice ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[17px] font-bold text-noir">{formatCurrency(displayPrice)}</span>
                {originalPrice && (
                  <>
                    <span className="text-[13px] text-stone line-through">{formatCurrency(originalPrice)}</span>
                    {discountPercent > 0 && (
                      <span className="text-[13px] font-semibold text-pink">{discountPercent}% off</span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal && openAuthModal()}
                className="text-[13px] font-semibold text-pink hover:underline text-left"
              >
                Login for Price
              </button>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!showPrice || isAddingToCart || isOutOfStock}
            className="mt-4 self-start flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-[13px] font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-pink"
            style={{
              background: isOutOfStock
                ? "#B9B2BE"
                : "linear-gradient(135deg,#F97316 0%,#FB923C 100%)",
            }}
          >
            {isAddingToCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedToCart ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── GRID MODE ── */
  return (
    <div
      className="group relative bg-white flex flex-col w-full h-full overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-pink/40 hover:shadow-card-hover hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image section */}
      <div className="relative block overflow-hidden bg-pink-50" style={{ aspectRatio: "1/1" }}>
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span
              className="text-[11px] font-bold text-white px-2 py-1 rounded-md shadow-sm"
              style={{ background: "linear-gradient(135deg,#F97316 0%,#F97316 100%)" }}
            >
              {discountPercent}% OFF
            </span>
          )}
          {showFlashSaleBadge && (
            <span className="text-[11px] font-bold text-white px-2 py-1 rounded-md bg-blueberry shadow-sm">
              FLASH SALE
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(42,42,53,0.12)] transition-all duration-300 cursor-pointer hover:scale-110",
            inWishlist ? "text-pink" : "text-noir/35 hover:text-pink"
          )}
          aria-label="Wishlist"
        >
          {isAddingToWishlist[product.id] ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Heart className={cn("h-[18px] w-[18px]", inWishlist && "fill-current")} />
          )}
        </button>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-noir bg-white px-4 py-2 rounded-full border border-line shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick view on hover (desktop) */}
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            "absolute bottom-2.5 left-2.5 right-2.5 z-20 py-2.5 hidden sm:flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-noir text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer shadow-sm",
            "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:text-pink"
          )}
          aria-label="Quick view"
        >
          <IconSearch className="h-3.5 w-3.5" strokeWidth={2.2} />
          Quick View
        </Link>
      </div>

      {/* Info section */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5">
        {brandName && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-pink line-clamp-1 mb-0.5">
            {brandName}
          </span>
        )}

        <Link href={`/products/${product.slug}`} className="block w-full">
          <h3 className="text-[13px] sm:text-[14px] font-medium leading-snug text-noir group-hover:text-pink transition-colors duration-300 line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 mb-2 min-h-[18px]">
          <RatingRow compact />
        </div>

        {/* Price */}
        <div className="mt-auto">
          {showPrice ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[15px] sm:text-base font-bold text-noir">
                {formatCurrency(displayPrice)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-[12px] text-stone line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[12px] font-semibold text-pink">
                      {discountPercent}% off
                    </span>
                  )}
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal && openAuthModal()}
              className="text-[13px] font-semibold text-pink hover:underline"
            >
              Login for Price
            </button>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!showPrice || isAddingToCart || isOutOfStock}
            className={cn(
              "mt-3 w-full h-10 flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 disabled:cursor-not-allowed",
              isOutOfStock
                ? "bg-ivory-deep text-stone"
                : "text-pink border border-pink bg-white hover:text-white hover:border-transparent hover:shadow-pink"
            )}
            onMouseEnter={(e) => {
              if (!isOutOfStock && showPrice)
                e.currentTarget.style.background = "linear-gradient(135deg,#F97316 0%,#FB923C 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
            }}
          >
            {isAddingToCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedToCart ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
