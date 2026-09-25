import express from "express";
import {
  getAllCategories,
  getProductsByCategory,
  getCategoriesWithSubCategories,
  getProductsBySubCategory,
} from "../controllers/category.controller.js";
import {
  getAllProducts,
  getProductBySlug,
  getProductVariant,
  getProductVariantById,
  getMaxPrice,
  getProductsByType,
  getSecretProducts,
  getSecretProductBySlug,
  getActiveStoreVerticals,
} from "../controllers/product.controller.js";
import { trackProductView } from "../middlewares/tracking.middleware.js";
import {
  getBrandsByTag,
  getBrandBySlug,
  getFilterAttributes,
  getPriceVisibilitySettings,
} from "../controllers/public.controller.js";
import { getPublishedBanners } from "../controllers/admin.banner.controller.js";
import { getActiveFlashSales, getActiveProductSections } from "../controllers/public.controller.js";
import { getActiveVideoReels } from "../controllers/admin.video-reel.controller.js";
import { verifyJWTToken, requireSecretAccess } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Categories
router.get("/categories", getAllCategories);
router.get("/categories-with-subcategories", getCategoriesWithSubCategories);
router.get("/categories/:slug/products", getProductsByCategory);
router.get("/subcategories/:slug/products", getProductsBySubCategory);

// Products
router.get("/products", getAllProducts);
router.get("/products/max-price", getMaxPrice);
router.get("/products/type/:productType", getProductsByType);
router.get("/products/:slug", trackProductView, getProductBySlug);
router.get("/product-variant", getProductVariant);
router.get("/products/variants/:id", getProductVariantById);

// Secret Collection - requires login + active Secret Access
router.get("/secret-products", verifyJWTToken, requireSecretAccess, getSecretProducts);
router.get("/secret-products/:slug", verifyJWTToken, requireSecretAccess, getSecretProductBySlug);

// Brands
router.get("/brands", getBrandsByTag);
router.get("/brands-by-tag", getBrandsByTag);
router.get("/brand/:slug", getBrandBySlug);

// Store Verticals
router.get("/store-verticals", getActiveStoreVerticals);

// Banners
router.get("/banners", getPublishedBanners);

// Flash Sales
router.get("/flash-sales", getActiveFlashSales);

// Product Sections
router.get("/product-sections", getActiveProductSections);

// Filter Attributes (Colors and Sizes)
router.get("/filter-attributes", getFilterAttributes);

// Price Visibility Settings
router.get("/price-visibility-settings", getPriceVisibilitySettings);

// Video Reels (Watch and Buy)
router.get("/video-reels", getActiveVideoReels);

export default router;
