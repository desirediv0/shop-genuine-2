import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const PageHero = ({
  title,
  description,
  breadcrumbs = [],
  variant = "default",
  size = "md"
}) => {
  const variants = {
    default: "bg-hero-brand",
    gradient: "bg-hero-gradient",
    dark: "bg-hero-dark",
    white: "bg-white",
  };

  const sizes = {
    sm: "py-8 md:py-10",
    md: "py-10 md:py-14",
    lg: "py-12 md:py-16",
  };

  // The "dark" variant is now the signature magenta gradient — content stays white on it.
  const isDark = variant === "dark";

  return (
    <section
      className={`${variants[variant]} ${sizes[size]} border-b border-line relative overflow-hidden`}
    >
      {/* Soft decorative blooms */}
      <span
        className={`pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full blur-3xl ${isDark ? "bg-white/15" : "bg-pink/10"
          }`}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute -bottom-28 -left-20 w-72 h-72 rounded-full blur-3xl ${isDark ? "bg-white/10" : "bg-tangerine/10"
          }`}
        aria-hidden="true"
      />

      <div className="section-container relative">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs mb-3 flex-wrap">
            <Link
              href="/"
              className={`transition-colors ${isDark ? "text-white/75 hover:text-white" : "text-stone hover:text-pink"}`}
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <ChevronRight
                  className={`h-3.5 w-3.5 ${isDark ? "text-white/45" : "text-stone/50"}`}
                  strokeWidth={2}
                />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={`transition-colors ${isDark ? "text-white/75 hover:text-white" : "text-stone hover:text-pink"}`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isDark ? "text-white font-medium" : "text-noir font-medium"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1
          className={`font-display text-2xl sm:text-3xl md:text-[38px] leading-tight max-w-4xl ${isDark ? "text-white" : "text-noir"
            }`}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            className={`text-sm md:text-base leading-relaxed max-w-3xl mt-3 ${isDark ? "text-white/85" : "text-stone"
              }`}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
