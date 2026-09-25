// jwtMiddleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";

export const verifyJWTToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.query?.accessToken;

    if (!token || token === "null" || token === "undefined" || !token.trim()) {
      throw new ApiError(401, "Authentication required");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    } catch (err) {
      // Fallback check with JWT_SECRET if ACCESS_JWT_SECRET differs
      if (process.env.JWT_SECRET && process.env.JWT_SECRET !== process.env.ACCESS_JWT_SECRET) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } else {
        throw err;
      }
    }

    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) {
      throw new ApiError(401, "Invalid token payload");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        otpVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid token or user not found");
    }

    // Login checks isActive, but tokens outlive that check: without this, a
    // deactivated or deleted account keeps working until its token expires.
    if (!user.isActive) {
      throw new ApiError(401, "This account is no longer active");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }

    // Only log unexpected non-auth server errors
    console.error("JWT Verification Error:", error);
    throw new ApiError(500, "Authentication error", [error.message]);
  }
});

// Admin authentication middleware
export const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.adminToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.query?.adminToken;

    if (!token || token === "null" || token === "undefined" || !token.trim()) {
      throw new ApiError(401, "Admin authentication required");
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const adminId = decoded?.id || decoded?.adminId;
    if (!adminId) {
      throw new ApiError(401, "Invalid admin token payload");
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        permissions: {
          select: {
            resource: true,
            action: true,
          },
        },
      },
    });

    if (!admin) {
      throw new ApiError(401, "Invalid token or admin not found");
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Admin account is inactive");
    }

    // Map permissions for easier access
    const permissionsArray = admin.permissions.map(
      (p) => `${p.resource}:${p.action}`
    );

    // Add formatted permissions to the admin object
    admin.permissions = permissionsArray;

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid admin token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Admin token expired");
    }
    throw error;
  }
});

// Permission checking middleware
export const hasPermission = (resource, action) => {
  return asyncHandler(async (req, res, next) => {
    const admin = req.admin;

    if (!admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    // Super admins have all permissions
    if (admin.role === "SUPER_ADMIN") {
      return next();
    }

    const hasAccess = admin.permissions.includes(`${resource}:${action}`);

    if (!hasAccess) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action"
      );
    }

    next();
  });
};

// Partner authentication middleware
export const verifyPartnerToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.partnerToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.query?.partnerToken;

    if (!token || token === "null" || token === "undefined" || !token.trim()) {
      throw new ApiError(401, "Partner authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const partnerId = decoded?.id || decoded?.partnerId;
    if (!partnerId) {
      throw new ApiError(401, "Invalid partner token payload");
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        commissionRate: true,
        createdAt: true
      }
    });

    if (!partner) {
      throw new ApiError(401, "Invalid partner token");
    }

    if (!partner.isActive) {
      throw new ApiError(401, "Partner account is inactive");
    }

    req.partner = partner;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, error?.message || "Invalid partner token");
  }
});

/**
 * requireSecretAccess - Middleware that checks if the authenticated user
 * has an active SecretAccess record. Must be used AFTER verifyJWTToken.
 */
export const requireSecretAccess = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const now = new Date();
  const record = await prisma.secretAccess.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "USED"] },
      expiresAt: { gt: now },
    },
  });

  if (!record || record.usageCount >= record.usageLimit) {
    throw new ApiError(403, "Secret Collection access required");
  }

  // Update lastUsedAt
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress;
  const device = req.headers["user-agent"] || "Unknown";

  await prisma.secretAccess.update({
    where: { id: record.id },
    data: {
      lastUsedAt: now,
      lastUsedIP: ip,
      lastUsedDevice: device,
    },
  });

  req.secretAccess = record;
  next();
});
