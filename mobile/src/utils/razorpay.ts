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

import { Platform } from 'react-native';

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

/**
 * The shopper closed the payment sheet without paying. Not a failure: checkout
 * says so calmly instead of showing an error.
 */
export class PaymentCancelledError extends Error {
  constructor() {
    super('Payment cancelled. No order was placed.');
    this.name = 'PaymentCancelledError';
  }
}

/**
 * Razorpay's error codes differ by platform: Android's `Checkout.PAYMENT_CANCELED`
 * is 0 (read from the SDK's constants), while the iOS SDK uses 2 — and 2 means
 * NETWORK_ERROR on Android.
 */
const CANCELLED_CODE = Platform.OS === 'ios' ? 2 : 0;
const ANDROID_NETWORK_ERROR = 2;

/**
 * Turns the SDK's rejection into a sentence a shopper can read. `description`
 * is often a JSON string — `{"error":{"code":"BAD_REQUEST_ERROR","description":
 * "undefined",...}}` — which used to be shown verbatim in the toast.
 */
function toPaymentError(e: unknown): Error {
  const err = (e ?? {}) as { code?: number | string; description?: unknown };
  const code = Number(err.code);

  let inner: { description?: string; reason?: string } | undefined;
  if (typeof err.description === 'string') {
    try {
      inner = (JSON.parse(err.description) as { error?: typeof inner })?.error;
    } catch {
      // Plain text, handled below.
    }
  }

  if (code === CANCELLED_CODE || inner?.reason === 'payment_cancelled') {
    return new PaymentCancelledError();
  }
  if (Platform.OS === 'android' && code === ANDROID_NETWORK_ERROR) {
    return new Error('Could not reach the payment service. Check your internet and try again.');
  }

  // Only pass on a description that is actual prose.
  const text = inner?.description ?? (inner ? undefined : err.description);
  if (typeof text === 'string' && text && text !== 'undefined' && !text.trim().startsWith('{')) {
    return new Error(text);
  }
  return new Error('Payment failed. No order was placed — please try again.');
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
    throw toPaymentError(e);
  }
}
