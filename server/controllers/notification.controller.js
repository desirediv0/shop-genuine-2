import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { isExpoPushToken, sendPushToUser } from "../utils/pushNotification.js";

/**
 * Register (or re-register) this device for push.
 *
 * Called after sign-in and on every cold start, so it must be idempotent. The
 * token is the natural key: if the row already exists we re-point it at the
 * current user rather than inserting a duplicate, which is what stops a shared
 * device from notifying whoever owned it previously.
 */
export const registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, platform, deviceName, appVersion } = req.body;
  const userId = req.user.id;

  if (!token) {
    throw new ApiError(400, "Push token is required");
  }

  if (!isExpoPushToken(token)) {
    throw new ApiError(400, "Invalid Expo push token format");
  }

  const device = await prisma.deviceToken.upsert({
    where: { token: token.trim() },
    create: {
      token: token.trim(),
      userId,
      platform: platform || null,
      deviceName: deviceName || null,
      appVersion: appVersion || null,
      isActive: true,
    },
    update: {
      userId,
      platform: platform || undefined,
      deviceName: deviceName || undefined,
      appVersion: appVersion || undefined,
      isActive: true,
      lastSeenAt: new Date(),
    },
    select: { id: true, token: true, platform: true, isActive: true },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, { device }, "Device registered for notifications"));
});

/**
 * Detach this device on sign-out so the next person to use the phone does not
 * receive the previous user's order updates.
 */
export const unregisterDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) {
    throw new ApiError(400, "Push token is required");
  }

  // Scoped to this user so one account cannot unregister another's device.
  await prisma.deviceToken.updateMany({
    where: { token: token.trim(), userId },
    data: { isActive: false, userId: null },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Device unregistered from notifications"));
});

/** Lists the caller's registered devices. */
export const getMyDevices = asyncHandler(async (req, res) => {
  const devices = await prisma.deviceToken.findMany({
    where: { userId: req.user.id, isActive: true },
    select: {
      id: true,
      platform: true,
      deviceName: true,
      appVersion: true,
      lastSeenAt: true,
      createdAt: true,
    },
    orderBy: { lastSeenAt: "desc" },
  });

  res.status(200).json(new ApiResponsive(200, { devices }, "Devices fetched"));
});

/**
 * Sends a test push to the caller's own devices. Useful for verifying setup
 * from the app without placing a real order.
 */
export const sendTestPush = asyncHandler(async (req, res) => {
  const accepted = await sendPushToUser(req.user.id, {
    title: "Shop Genuine",
    body: "Push notifications are working.",
    data: { type: "TEST" },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, { accepted }, `Test push sent to ${accepted} device(s)`));
});
