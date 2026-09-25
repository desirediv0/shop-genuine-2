import express from "express";
import {
  createStoreVertical,
  updateStoreVertical,
  deleteStoreVertical,
  getStoreVerticals,
  getStoreVerticalById,
  toggleStoreVerticalStatus,
  reorderStoreVerticals,
} from "../controllers/admin.storeVertical.controller.js";
import {
  hasPermission,
  verifyAdminJWT,
} from "../middlewares/admin.middleware.js";
import { uploadFiles } from "../middlewares/multer.middlerware.js";

const router = express.Router();

// Create Store Vertical
router.post(
  "/store-verticals",
  verifyAdminJWT,
  hasPermission("storeVerticals", "create"),
  uploadFiles.single("image"),
  createStoreVertical
);

// Reorder Store Verticals
router.patch(
  "/store-verticals/reorder",
  verifyAdminJWT,
  hasPermission("storeVerticals", "update"),
  reorderStoreVerticals
);

// Toggle Store Vertical status
router.patch(
  "/store-verticals/:storeVerticalId/toggle-status",
  verifyAdminJWT,
  hasPermission("storeVerticals", "update"),
  toggleStoreVerticalStatus
);

// Update Store Vertical
router.patch(
  "/store-verticals/:storeVerticalId",
  verifyAdminJWT,
  hasPermission("storeVerticals", "update"),
  uploadFiles.single("image"),
  updateStoreVertical
);

// Delete Store Vertical
router.delete(
  "/store-verticals/:storeVerticalId",
  verifyAdminJWT,
  hasPermission("storeVerticals", "delete"),
  deleteStoreVertical
);

// Get All Store Verticals
router.get(
  "/store-verticals",
  verifyAdminJWT,
  hasPermission("storeVerticals", "read"),
  getStoreVerticals
);

// Get Store Vertical By Id
router.get(
  "/store-verticals/:storeVerticalId",
  verifyAdminJWT,
  hasPermission("storeVerticals", "read"),
  getStoreVerticalById
);

export default router;
