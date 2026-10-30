/* eslint-disable @next/next/no-img-element */
import PhoneShowcase from "./PhoneShowcase";

export const metadata = {
  title: "Download the Shop Genuine App",
  description:
    "Shop Genuine is now available only on the mobile app. Download it from the Play Store or App Store.",
  robots: { index: false },
};

// TODO: turn these buttons into links once the Play Store / App Store URLs are available

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-4 w-4",
};

const PERKS = [
  {
    short: "100% authentic",
    text: "100% authentic products",
    icon: (
      <svg {...svgProps}>
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    short: "Fast delivery",
    text: "Fast delivery across India",
    icon: (
      <svg {...svgProps}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    short: "App-only deals",
    text: "App-only offers & deals",
    icon: (
      <svg {...svgProps}>
        <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.2" />
      </svg>
    ),
  },
];

function StoreButton({ icon, small, big }) {
  return (
    <button
      type="button"
      className="cursor-default sg-glow flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-2.5 text-left text-white ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-black sm:min-w-[200px]"
    >
      <img src={icon} alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
      <span className="leading-tight">
        <span className="block text-[10px] uppercase tracking-wider text-white/70">{small}</span>
        <span className="block text-base font-semibold">{big}</span>
      </span>
    </button>
  );
}

const PAYMENTS = [
  { src: "/visa.png", alt: "Visa" },
  { src: "/mc.png", alt: "Mastercard" },
  { src: "/upi.png", alt: "UPI" },
];

const css = `
html, body { overflow: hidden !important; height: 100%; }
@keyframes sg-float { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(20px,-30px,0) scale(1.1); } }
@keyframes sg-pulse { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .95; transform: scale(1.08); } }
@keyframes sg-glow { 0%,100% { box-shadow: 0 0 14px rgba(249,115,22,.35), 0 8px 20px rgba(17,24,39,.25); } 50% { box-shadow: 0 0 28px rgba(236,72,153,.6), 0 8px 20px rgba(17,24,39,.25); } }
.sg-orb { animation: sg-float 9s ease-in-out infinite; }
.sg-halo { animation: sg-pulse 4s ease-in-out infinite; }
.sg-glow { animation: sg-glow 3s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .sg-orb, .sg-halo, .sg-glow { animation: none; } }
`;

export default function GetAppPage() {
  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto overflow-x-hidden overscroll-contain bg-gradient-to-br from-[#fff1e6] via-[#ffe4ef] to-[#efe4ff]">
      <style>{css}</style>

      {/* background: soft dot grid + glowing orbs */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(190,60,120,.25) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div className="sg-orb absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-400/50 blur-3xl" />
        <div className="sg-orb absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-pink-400/50 blur-3xl [animation-delay:-3s]" />
        <div className="sg-orb absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-purple-400/40 blur-3xl [animation-delay:-6s]" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col px-5 py-4 sm:px-8 sm:py-6">
        <header className="flex shrink-0 items-center">
          <span className="rounded-xl bg-white/90 px-3 py-1.5 shadow-md shadow-pink-500/10 ring-1 ring-black/5">
            <img src="/logo.png" alt="Shop Genuine" className="h-8 w-auto sm:h-10" />
          </span>
        </header>

        <main className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-2 lg:gap-12">
          <section className="text-center lg:text-left">
            <span className="inline-block rounded-md bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-700 ring-1 ring-orange-200 backdrop-blur">
              Now on mobile
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 min-[400px]:text-4xl sm:text-5xl xl:text-6xl">
              Shop Genuine,
              <br />
              <span
                className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 18px rgba(236,72,153,.35))" }}
              >
                only on the app.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:mt-5 sm:text-base lg:mx-0 xl:text-lg">
              Shopping is now available only on our mobile app. Download it from
              the Play Store or App Store.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row sm:mt-8 lg:justify-start">
              <StoreButton icon="/playstore-icon.png" small="Get it on" big="Google Play" />
              <StoreButton icon="/appstore-icon.png" small="Download on the" big="App Store" />
            </div>

            <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-7 lg:justify-start">
              {PERKS.map((p) => (
                <li
                  key={p.text}
                  className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur sm:px-3 sm:py-2 sm:text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,.6)]">
                    {p.icon}
                  </span>
                  <span className="sm:hidden">{p.short}</span>
                  <span className="hidden sm:inline">{p.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
              <span className="text-xs font-medium text-gray-600">Secure payments:</span>
              {PAYMENTS.map((p) => (
                <span key={p.alt} className="flex h-8 w-12 items-center justify-center rounded-md bg-white px-2 shadow-sm ring-1 ring-black/5">
                  <img src={p.src} alt={p.alt} className="max-h-5 w-auto" />
                </span>
              ))}
            </div>
          </section>

          {/* phone mockups */}
          <section className="flex h-[clamp(360px,62vh,520px)] items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="sg-halo absolute inset-x-0 inset-y-6 rounded-full bg-gradient-to-br from-orange-400/60 via-pink-400/60 to-purple-400/60 blur-3xl" />
              <PhoneShowcase />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
