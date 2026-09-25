import "./globals.css";
import { Poppins, Dancing_Script } from "next/font/google";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { StoreTypeProvider } from "@/context/StoreTypeContext";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { AuthModal } from "@/components/ui/AuthModal";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const poppinsBody = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-script",
  display: "swap",
});

export const metadata = {
  title: "Shop Genuine — Authentic Nutrition, Grocery, Pharmacy & Cosmetics",
  description:
    "Shop 100% authentic products at Shop Genuine — nutrition, grocery, pharmacy and cosmetics from the brands you love. Genuine products, honest prices, fast delivery across India.",
  keywords:
    "Shop Genuine, authentic products, nutrition online, grocery, pharmacy, cosmetics, beauty products India, original brands",
  authors: [{ name: "Shop Genuine" }],
  openGraph: {
    title: "Shop Genuine — Authentic Nutrition, Grocery, Pharmacy & Cosmetics",
    description:
      "Nutrition, grocery, pharmacy and cosmetics from the brands you love — 100% authentic, delivered across India.",
    type: "website",
    locale: "en_IN",
    siteName: "Shop Genuine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Genuine — Authentic Nutrition, Grocery, Pharmacy & Cosmetics",
    description:
      "Nutrition, grocery, pharmacy and cosmetics from the brands you love — 100% authentic, delivered across India.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${poppinsBody.variable} ${dancingScript.variable}`}
    >
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
          <StoreTypeProvider>
            <Toaster
              position="top-center"
              style={{ zIndex: 999999 }}
              toastOptions={{
                style: {
                  background: "#FFFFFF",
                  color: "#2A2A35",
                  border: "1px solid #F1E1E9",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  boxShadow: "0 8px 30px rgba(249, 115, 22,0.16)",
                  zIndex: 999999,
                },
              }}
            />
            {/* <SiteFX /> */}
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
            <AuthModal />
          </StoreTypeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
