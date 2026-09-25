import { prisma } from "../config/db.js";
import { logger } from "./logger.js";

/**
 * Expo push delivery.
 *
 * Expo's service fronts both APNs and FCM, so the app only ever deals in Expo
 * tokens and the server needs no Firebase/Apple credentials for basic sends.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 *
 * Every function here is best-effort and never throws: a push failure must not
 * roll back an order or fail an admin's status update. Callers are expected to
 * ignore the return value.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Expo rejects batches larger than 100.
const BATCH_SIZE = 100;

/** Expo tokens look like ExponentPushToken[xxx] or ExpoPushToken[xxx]. */
export function isExpoPushToken(token) {
  return (
    typeof token === "string" &&
    /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token.trim())
  );
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Deactivates tokens Expo reports as unregistered, so uninstalled apps stop
 * being retried forever.
 */
async function handleReceipts(tickets, tokens) {
  const dead = [];

  tickets.forEach((ticket, i) => {
    if (
      ticket?.status === "error" &&
      ticket?.details?.error === "DeviceNotRegistered"
    ) {
      dead.push(tokens[i]);
    }
  });

  if (!dead.length) return;

  try {
    await prisma.deviceToken.updateMany({
      where: { token: { in: dead } },
      data: { isActive: false },
    });
    logger("INFO", `Deactivated ${dead.length} unregistered push token(s)`);
  } catch (err) {
    logger("ERROR", "Failed deactivating push tokens", err?.message);
  }
}

/**
 * Sends to explicit tokens. Returns the number accepted; never throws.
 */
export async function sendPushToTokens(tokens, { title, body, data = {} }) {
  try {
    const valid = [...new Set((tokens || []).filter(isExpoPushToken))];
    if (!valid.length) return 0;

    let accepted = 0;

    for (const group of chunk(valid, BATCH_SIZE)) {
      const messages = group.map((to) => ({
        to,
        title,
        body,
        data,
        sound: "default",
        channelId: "default",
        priority: "high",
      }));

      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      if (!res.ok) {
        logger("ERROR", `Expo push HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const tickets = Array.isArray(json?.data) ? json.data : [];
      accepted += tickets.filter((t) => t?.status === "ok").length;

      await handleReceipts(tickets, group);
    }

    return accepted;
  } catch (err) {
    // Swallow deliberately — a push must never break the calling flow.
    logger("ERROR", "Push send failed", err?.message);
    return 0;
  }
}

/**
 * Sends to every active device belonging to a user. Never throws.
 */
export async function sendPushToUser(userId, payload) {
  try {
    if (!userId) return 0;

    const rows = await prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    if (!rows.length) return 0;
    return await sendPushToTokens(rows.map((r) => r.token), payload);
  } catch (err) {
    logger("ERROR", "Push lookup failed", err?.message);
    return 0;
  }
}

/** Human-readable copy for each OrderStatus value. */
const ORDER_STATUS_COPY = {
  PENDING: (n) => ({ title: "Order placed", body: `We've received order ${n}.` }),
  PROCESSING: (n) => ({ title: "Order confirmed", body: `Order ${n} is being prepared.` }),
  PAID: (n) => ({ title: "Payment received", body: `Payment for order ${n} is confirmed.` }),
  SHIPPED: (n) => ({ title: "Order shipped", body: `Order ${n} is on its way.` }),
  DELIVERED: (n) => ({ title: "Order delivered", body: `Order ${n} has been delivered. Enjoy!` }),
  CANCELLED: (n) => ({ title: "Order cancelled", body: `Order ${n} has been cancelled.` }),
  REFUNDED: (n) => ({ title: "Refund issued", body: `Your refund for order ${n} is on its way.` }),
  RETURN_APPROVED: (n) => ({ title: "Return approved", body: `Your return for order ${n} is approved.` }),
  RETURN_COMPLETED: (n) => ({ title: "Return complete", body: `Your return for order ${n} is complete.` }),
};

/**
 * Notifies a customer that their order changed status. Never throws.
 * Deep-links into the app's order screen via the `data` payload.
 */
export async function sendOrderStatusPush(userId, orderId, orderNumber, status) {
  const build = ORDER_STATUS_COPY[status];
  if (!build) return 0;

  const { title, body } = build(orderNumber);

  return sendPushToUser(userId, {
    title,
    body,
    data: { type: "ORDER_STATUS", orderId, orderNumber, status },
  });
}
