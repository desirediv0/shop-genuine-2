import { randomUUID } from "crypto";
import { prisma } from "../config/db.js";

/**
 * Erases a user's personal data.
 *
 * Most of the user's rows (addresses, cart, wishlist, reviews, device tokens,
 * referrals, returns) cascade on delete, and analytics rows null out. Two
 * relations deliberately RESTRICT: Order and CustomPerfumeOrder. Those are
 * financial records a business has to keep for tax and accounting, so wiping
 * them to satisfy a deletion request would destroy books that must be retained.
 *
 * So the behaviour depends on whether the account ever transacted:
 *
 *   - No orders  -> the row is deleted outright and cascades clean up the rest.
 *   - Has orders -> personal data is deleted and the User row is anonymised:
 *                   "Deleted customer", no phone or password, a non-routable
 *                   placeholder email, and isActive false. The account can never
 *                   be signed into again, while the order ledger stays intact.
 *
 * The order history must stay whole for the admin: the delivery address an
 * order was shipped to is part of the order record (invoice, returns, and
 * delivering anything still in transit), so addresses that orders point at
 * are kept. Only addresses no order uses are deleted.
 *
 * Either way the user cannot log in afterwards and their personal data is gone.
 *
 * @returns {Promise<{mode: 'DELETED'|'ANONYMISED', retainedOrders: number}>}
 */
export async function deleteUserAccount(userId) {
  const [orderCount, customOrderCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.customPerfumeOrder.count({ where: { userId } }),
  ]);

  const retainedOrders = orderCount + customOrderCount;

  if (retainedOrders === 0) {
    await prisma.$transaction(async (tx) => {
      // Belt and braces: DeviceToken cascades, but an orphaned push token would
      // keep notifying a stranger's phone, so remove it explicitly first.
      await tx.deviceToken.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { mode: "DELETED", retainedOrders: 0 };
  }

  await prisma.$transaction(async (tx) => {
    // Remove everything personal. Orders are left alone.
    await tx.deviceToken.deleteMany({ where: { userId } });
    await tx.cartItem.deleteMany({ where: { userId } });
    await tx.wishlistItem.deleteMany({ where: { userId } });
    await tx.review.deleteMany({ where: { userId } });
    await tx.userCoupon.deleteMany({ where: { userId } });
    // Keep every address an order was shipped to. Deleting them all used to
    // null Order.shippingAddressId, so the admin lost where (and to whom, with
    // which phone number) past and in-transit orders were delivered.
    await tx.address.deleteMany({ where: { userId, orders: { none: {} } } });
    await tx.account.deleteMany({ where: { userId } });

    await tx.user.update({
      where: { id: userId },
      data: {
        // Unique constraint still applies, so the placeholder must be unique.
        // .invalid is reserved by RFC 2606 and can never receive mail.
        email: `deleted-${randomUUID()}@deleted.invalid`,
        // Shown wherever the admin lists this customer's orders.
        name: "Deleted customer",
        phone: null,
        password: null,
        otp: null,
        otpVerified: false,
        isActive: false,
        referralCode: null,
        razorpayCustomerId: null,
      },
    });
  });

  return { mode: "ANONYMISED", retainedOrders };
}
