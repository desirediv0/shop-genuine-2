/**
 * Razorpay bridge.
 *
 * react-native-razorpay is a native module, so it cannot run in Expo Go — only
 * in a development build or a production (EAS) build. We therefore load it
 * lazily and report availability, so checkout can fall back to Cash on Delivery
 * with a clear message instead of crashing on a missing native module.
 *
 * To enable card/UPI payments:
 *   npx expo install react-native-razorpay
 *   npx expo prebuild
 *   eas build --profile development --platform android
 */

export interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  orderId: string;
  /** Amount in paise, exactly as the server created the order. */
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { email?: string; contact?: string; name?: string };
}

type RazorpayCheckoutModule = {
  open: (options: Record<string, unknown>) => Promise<RazorpayResult>;
};

function loadModule(): RazorpayCheckoutModule | null {
  try {
    // Deliberately dynamic so Metro does not hard-fail when the module is absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-razorpay');
    return (mod?.default ?? mod) as RazorpayCheckoutModule;
  } catch {
    return null;
  }
}

export function isRazorpayAvailable(): boolean {
  return loadModule() !== null;
}

export async function payWithRazorpay(options: RazorpayOptions): Promise<RazorpayResult> {
  const RazorpayCheckout = loadModule();
  if (!RazorpayCheckout) {
    throw new Error(
      'Online payment is unavailable in this build. Please use Cash on Delivery.',
    );
  }

  try {
    return await RazorpayCheckout.open({
      key: options.key,
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#F97316' },
    });
  } catch (e) {
    // The SDK rejects with a descriptive object when the user cancels.
    const err = e as { description?: string; code?: number | string };
    throw new Error(err?.description || 'Payment was cancelled or failed.');
  }
}
