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
 *                   no name, phone, or password, a non-routable placeholder
 *                   email, and isActive false. The account can never be signed
 *                   into again and holds no personal data, while the order
 *                   ledger stays intact.
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
    // Order.shippingAddressId is nullable and SET NULL, so orders survive this.
    await tx.address.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });

    await tx.user.update({
      where: { id: userId },
      data: {
        // Unique constraint still applies, so the placeholder must be unique.
        // .invalid is reserved by RFC 2606 and can never receive mail.
        email: `deleted-${randomUUID()}@deleted.invalid`,
        name: null,
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
