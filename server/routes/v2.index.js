import express from "express";

// Mobile app (v2) route index.
// Reuses the exact same routers/controllers as the website APIs —
// nothing duplicated here. This file only mounts them under /api/v2
// so the mobile app has a stable, documented entry point separate
// from the web client's /api/* paths.
import userRoutes from "./user.routes.js";
import publicRoutes from "./public.routes.js";
import cartRoutes from "./cart.routes.js";
import paymentRoutes from "./payment.routes.js";
import couponRoutes from "./coupon.routes.js";
import returnRoutes from "./return.routes.js";
import bundleRoutes from "./bundle.routes.js";
import contentRoutes from "./content.routes.js";
import faqRoutes from "./faq.routes.js";
import referralRoutes from "./referral.routes.js";
import secretAccessRoutes from "./secretAccess.routes.js";
import newsletterRoutes from "./newsletter.routes.js";
import fragranceQuizRoutes from "./fragrance-quiz.routes.js";
import customPerfumeRoutes from "./custom-perfume.routes.js";
import customPerfumeOrderRoutes from "./custom-perfume-order.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = express.Router();

// Auth, profile, addresses, wishlist, orders, reviews
router.use("/users", userRoutes);

// Product/category/brand/banner browsing (public, no token required)
router.use("/public", publicRoutes);

// Push notifications (mobile only)
router.use("/notifications", notificationRoutes);

// Cart
router.use("/cart", cartRoutes);

// Checkout / Razorpay / COD / order history
router.use("/payment", paymentRoutes);

// Coupons, returns, bundles
router.use("/coupons", couponRoutes);
router.use("/returns", returnRoutes);
router.use("/bundles", bundleRoutes);

// Content, FAQs, referrals, secret access, newsletter, fragrance quiz, custom perfume
router.use("/content", contentRoutes);
router.use("/faqs", faqRoutes);
router.use("/referrals", referralRoutes);
router.use("/secret-access", secretAccessRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/fragrance-quiz", fragranceQuizRoutes);
router.use("/custom-perfume", customPerfumeRoutes);
router.use("/", customPerfumeOrderRoutes);

export default router;
