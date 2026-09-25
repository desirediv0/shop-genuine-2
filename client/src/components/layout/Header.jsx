"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { StoreVerticalTabs } from "@/components/layout/StoreVerticalTabs";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn, sortCategories } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  IconSearch,
  IconUser,
  IconShoppingBag,
  IconHeart,
  IconMenu2,
  IconX,
  IconPackage,
  IconLogout,
  IconMapPin,
  IconPhone,
  IconBrandInstagram,
  IconArrowUpRight,
  IconHome,
  IconBuildingStore,
  IconCategory,
  IconCompass,
  IconGift,
  IconFlask,
  IconInfoCircle,
  IconTruck,
  IconSparkles,
  IconChevronRight,
} from "@tabler/icons-react";

const CONTACT = {
  email: "connect.genuinenutrition@gmail.com",
  phone: "+91 80532 10008",
  whatsapp: "918053210008",
};

const NAV_LINKS = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/products", label: "Shop", icon: IconBuildingStore },
  // { href: "/bundles", label: "Bundle", icon: IconPackage },
  // { href: "/categories", label: "Collection", icon: IconCategory },
  // { href: "/fragrance-finder", label: "Fragrance Finder", icon: IconCompass },
  // { href: "/corporate-gifting", label: "Corporate Gifting", icon: IconGift },
  // { href: "/custom-perfume", label: "Custom Perfume", icon: IconFlask },
  { href: "/about", label: "About", icon: IconInfoCircle },
  { href: "/contact", label: "Contact", icon: IconPhone },
];

const ANNOUNCEMENTS = [
  "100% Authentic Products ✨",
  "Free Shipping on orders above ₹499",
  "Easy Returns • Secure Payments",
];

const SEARCH_SUGGESTIONS = [
  "Lipstick",
  "Foundation",
  "Face Serum",
  "Sunscreen",
  "Kajal",
  "Perfume",
  "Shampoo",
  "Moisturiser",
];

function AvatarCircle({ name, size = "sm" }) {
  const dim = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inlineQuery, setInlineQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories(sortCategories(res.data?.categories || [])))
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleInlineSearch = (e) => {
    e.preventDefault();
    if (!inlineQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(inlineQuery)}`);
    setInlineQuery("");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const cartCount = getCartItemCount();

  const iconBtn =
    "relative flex flex-col items-center justify-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl text-noir/75 hover:text-pink hover:bg-pink-50 transition-all duration-300";

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-50 w-full bg-white transition-shadow duration-300",
          isScrolled ? "shadow-[0_4px_20px_rgba(42,42,53,0.08)]" : "border-b border-line"
        )}
      >
        {/* ── Announcement bar ── */}
        <div
          className="overflow-hidden text-white"
          style={{ background: "linear-gradient(90deg,#D95E08 0%,#F97316 45%,#F97316 100%)" }}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 h-9">
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <IconBrandInstagram className="h-4 w-4" stroke={1.8} />
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex md:justify-center animate-marquee md:animate-none whitespace-nowrap text-[11px] sm:text-xs font-medium">
                  {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((txt, i) => (
                    <span key={i} className={cn("mx-5", i >= ANNOUNCEMENTS.length && "md:hidden")}>
                      {txt}
                      <span className="ml-5 text-white/40">|</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs font-medium">
                <Link href="/track-order" className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
                  <IconTruck className="h-4 w-4" stroke={1.8} />
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main header row ── */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center gap-3 md:gap-6 h-[64px] md:h-[84px]">
            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-noir/75 hover:text-pink hover:bg-pink-50 transition-colors"
              aria-label="Menu"
            >
              <IconMenu2 className="h-6 w-6" stroke={1.8} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Shop Genuine"
                width={200}
                height={64}
                className="h-9 sm:h-11 md:h-14 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop inline search */}
            <form
              onSubmit={handleInlineSearch}
              className="hidden lg:flex flex-1 max-w-2xl mx-auto"
            >
              <div className="relative w-full group">
                <IconSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone group-focus-within:text-pink transition-colors"
                  stroke={1.8}
                />
                <input
                  type="text"
                  value={inlineQuery}
                  onChange={(e) => setInlineQuery(e.target.value)}
                  placeholder="Search for products, brands and more..."
                  className="w-full h-12 pl-12 pr-28 text-sm bg-pink-50 border border-line rounded-full outline-none transition-all duration-300 placeholder:text-stone/70 focus:bg-white focus:border-pink focus:shadow-[0_0_0_4px_rgba(249, 115, 22,0.10)]"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 rounded-full text-white text-[13px] font-semibold transition-all duration-300 hover:shadow-pink"
                  style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn("lg:hidden", iconBtn)}
                aria-label="Search"
              >
                <IconSearch className="h-[22px] w-[22px]" stroke={1.8} />
              </button>

              <ClientOnly>
                {isAuthenticated ? (
                  <Link href="/account" className={cn(iconBtn, "hidden sm:flex")} aria-label="Account">
                    <AvatarCircle name={user?.name} size="sm" />
                    <span className="hidden xl:block text-[11px] font-medium leading-none">Account</span>
                  </Link>
                ) : (
                  <Link href="/auth" className={cn(iconBtn, "hidden sm:flex")} aria-label="Login">
                    <IconUser className="h-[22px] w-[22px]" stroke={1.8} />
                    <span className="hidden xl:block text-[11px] font-medium leading-none">Sign in</span>
                  </Link>
                )}
              </ClientOnly>

              <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                <IconHeart className="h-[22px] w-[22px]" stroke={1.8} />
                <span className="hidden xl:block text-[11px] font-medium leading-none">Wishlist</span>
              </Link>

              <ClientOnly>
                <Link href="/cart" className={iconBtn} aria-label="Cart">
                  <span className="relative">
                    <IconShoppingBag className="h-[22px] w-[22px]" stroke={1.8} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-white"
                        style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden xl:block text-[11px] font-medium leading-none">Bag</span>
                </Link>
              </ClientOnly>
            </div>
          </div>
        </div>

        {/* ── Category strip (desktop) ── */}
        <nav className="hidden lg:block border-t border-line bg-white">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-[1440px] mx-auto flex items-center justify-center h-12">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-24">
                {NAV_LINKS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "relative px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-300",
                        active ? "text-pink" : "text-noir/75 hover:text-pink hover:bg-pink-50"
                      )}
                    >
                      {label}
                      <span
                        className={cn(
                          "absolute -bottom-[1px] left-3 right-3 xl:left-4 xl:right-4 h-[3px] rounded-t-full bg-pink transition-all duration-300",
                          active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                        )}
                      />
                    </Link>
                  );
                })}

                {categories.length > 0 && (
                  <>
                    <span className="mx-1 h-5 w-px bg-line shrink-0" />
                    {categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="px-3 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap capitalize rounded-lg text-noir/75 hover:text-pink hover:bg-pink-50 transition-all duration-300"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>

              <Link
                href="/products?sort=discount"
                className="absolute right-0 shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold text-white transition-transform duration-300 hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg,#F97316 0%,#F97316 100%)" }}
              >
                <IconSparkles className="h-4 w-4" stroke={2} />
                Offers
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Store / vertical tabs (admin-managed) ── */}
        <StoreVerticalTabs />
      </header>

      <SearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchInputRef={searchInputRef}
        categories={categories}
        router={router}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        categories={categories}
        cartCount={cartCount}
        handleLogout={handleLogout}
        pathname={pathname}
      />
    </>
  );
}

function SearchDialog({
  open,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchInputRef,
  categories,
  router,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-white p-0 overflow-hidden border border-line shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 sm:px-8 pt-8 pb-1">
          <DialogTitle className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.03em] text-pink block mb-2">
              Shop Genuine
            </span>
            <span className="font-display text-xl text-noir">What are you looking for?</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 sm:px-8 pb-8">
          <form onSubmit={handleSearch} className="relative mt-5">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" stroke={1.8} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Lipstick, serum, shampoo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-28 text-[15px] bg-pink-50 border border-line rounded-full outline-none transition-all duration-300 placeholder:text-stone/70 focus:bg-white focus:border-pink focus:shadow-[0_0_0_4px_rgba(249, 115, 22,0.10)]"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-stone hover:text-noir transition-colors"
                  aria-label="Clear"
                >
                  <IconX className="h-5 w-5" stroke={1.8} />
                </button>
              )}
              <button
                type="submit"
                className="h-10 px-5 rounded-full text-white text-[13px] font-semibold transition-all duration-300 hover:shadow-pink"
                style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-3 text-stone">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/products?search=${encodeURIComponent(term)}`);
                  }}
                  className="chip text-xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-3 text-stone">
                Shop by category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="chip text-xs capitalize"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileMenu({ isOpen, onClose, user, isAuthenticated, categories, cartCount, handleLogout, pathname }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-2xl flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Shop Genuine"
                width={160}
                height={52}
                className="h-10 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-noir/50 hover:text-pink hover:bg-pink-50 transition-colors"
                aria-label="Close menu"
              >
                <IconX className="h-6 w-6" stroke={1.8} />
              </button>
            </div>

            {/* User */}
            <ClientOnly>
              <div
                className="px-5 py-5 flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#FFF5F9 0%,#FCE7F0 100%)" }}
              >
                {isAuthenticated ? (
                  <div className="flex items-center gap-3.5">
                    <AvatarCircle name={user?.name} size="lg" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] text-noir truncate">{user?.name || "User"}</p>
                      <p className="text-[13px] text-stone truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-noir mb-1">Welcome to Shop Genuine</p>
                    <p className="text-xs text-stone mb-4">Sign in for offers and faster checkout</p>
                    <div className="flex gap-3">
                      <Link href="/auth" className="flex-1" onClick={onClose}>
                        <button
                          className="w-full h-11 text-[13px] font-semibold text-white rounded-full transition-transform duration-300 active:scale-[0.98]"
                          style={{ background: "linear-gradient(135deg,#F97316 0%,#FB923C 100%)" }}
                        >
                          Sign In
                        </button>
                      </Link>
                      <Link href="/auth?tab=register" className="flex-1" onClick={onClose}>
                        <button className="w-full h-11 text-[13px] font-semibold text-pink bg-white border border-pink rounded-full transition-colors hover:bg-pink hover:text-white">
                          Register
                        </button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </ClientOnly>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
              <div className="px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-stone mb-3">
                  Navigation
                </p>
                {NAV_LINKS.map(({ href, label, icon: Icon }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between py-3 px-3 -mx-3 rounded-xl group transition-colors",
                        pathname === href
                          ? "text-pink bg-pink-50 font-semibold"
                          : "text-noir/80 hover:text-pink hover:bg-pink-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && (
                          <span className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                            <Icon className="h-[18px] w-[18px] text-pink" stroke={1.8} />
                          </span>
                        )}
                        <span className="text-[15px] font-medium">{label}</span>
                      </div>
                      <IconChevronRight className="h-4 w-4 opacity-40" stroke={2} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {categories.length > 0 && (
                <div className="px-5 py-5 border-t border-line">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-stone mb-3">
                    Shop by Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 10).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={onClose}
                        className="chip text-xs capitalize"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <ClientOnly>
                {isAuthenticated && (
                  <div className="px-5 py-5 border-t border-line">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-stone mb-3">
                      Account
                    </p>
                    {[
                      { href: "/account", icon: IconUser, label: "Profile" },
                      { href: "/account/orders", icon: IconPackage, label: "My Orders" },
                      { href: "/account/addresses", icon: IconMapPin, label: "Addresses" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-2.5 text-[15px] text-noir/80 hover:text-pink transition-colors"
                      >
                        <Icon className="h-[18px] w-[18px] text-stone" stroke={1.8} />
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      className="flex items-center gap-3 w-full py-2.5 text-[15px] text-red-500 hover:text-red-600 transition-colors"
                    >
                      <IconLogout className="h-[18px] w-[18px]" stroke={1.8} />
                      Sign Out
                    </button>
                  </div>
                )}
              </ClientOnly>

              <div className="px-5 py-5 border-t border-line">
                <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-stone mb-3">
                  Help
                </p>
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/shipping-policy", label: "Shipping Policy" },
                  { href: "/faqs", label: "FAQs" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="block py-2.5 text-[15px] text-noir/70 hover:text-pink transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div
                className="mx-5 mt-3 mb-8 p-5 rounded-2xl"
                style={{ background: "linear-gradient(135deg,#FFF5F9 0%,#FCE7F0 100%)" }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-pink mb-2.5">
                  Need help?
                </p>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center gap-3 text-[15px] font-medium text-noir/80 hover:text-pink transition-colors"
                >
                  <IconPhone className="h-[18px] w-[18px] flex-shrink-0 text-pink" stroke={1.8} />
                  {CONTACT.phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
