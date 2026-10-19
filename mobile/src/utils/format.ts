import type { Numeric, Order, OrderItem } from '../types';

/** Prisma Decimal columns arrive as strings; normalise before arithmetic. */
export function toNumber(value: Numeric | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Whole rupees print as ₹31, anything with paise as ₹27.90. Rounding every
 * price to the rupee made a 10% coupon on ₹31 read "Total ₹28" while Razorpay
 * charged ₹27.90 — the app has to show the amount actually taken.
 */
export function formatPrice(value: Numeric | null | undefined): string {
  // Work in whole paise so float noise (31 - 3.1 = 27.900000000000002) never
  // decides which format is used.
  const paise = Math.round(toNumber(value) * 100);
  return paise % 100 === 0 ? inrWhole.format(paise / 100) : inrPaise.format(paise / 100);
}

export function formatDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function discountPercent(regular: Numeric, sale: Numeric): number {
  const r = toNumber(regular);
  const s = toNumber(sale);
  if (r <= 0 || s <= 0 || s >= r) return 0;
  return Math.round(((r - s) / r) * 100);
}

/** Product descriptions are stored as HTML; strip it for plain-text contexts. */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cheapest active variant — what the product card should price against. */
export function pickDefaultVariant<T extends { quantity: number; isActive: boolean; price: Numeric; salePrice: Numeric | null }>(
  variants: T[] | undefined,
): T | undefined {
  if (!variants?.length) return undefined;
  const inStock = variants.filter((v) => v.isActive && v.quantity > 0);
  const pool = inStock.length ? inStock : variants;
  return [...pool].sort(
    (a, b) =>
      toNumber(a.salePrice ?? a.price) - toNumber(b.salePrice ?? b.price),
  )[0];
}

export function variantLabel(attributes?: { attributeValue?: { value: string; attribute?: { name: string } } }[]): string {
  if (!attributes?.length) return '';
  return attributes
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(' / ');
}

/**
 * Order item name and image, resolved across the two shapes the API returns.
 * `/payment/orders` flattens them; `/users/orders/:id` carries the snapshot
 * fields and the live product instead, and the snapshot's image is null for
 * anything ordered before the server started recording it.
 */
export function orderItemName(item: OrderItem): string {
  return item.name ?? item.productName ?? item.product?.name ?? '';
}

export function orderItemImage(item: OrderItem): string | undefined {
  const images = item.product?.images;
  const fromProduct =
    images?.find((img) => img.isPrimary)?.url ?? images?.[0]?.url;
  return item.image ?? item.productImage ?? fromProduct ?? undefined;
}

/**
 * What to show a shopper as the payment method. The list and detail endpoints
 * disagree — the list says "CARD" where the detail says "RAZORPAY" for the same
 * order — so prefer the specific instrument wherever it is available and the
 * two screens agree.
 */
export function orderPaymentLabel(order: Order): string {
  const method = order.razorpayPayment?.paymentMethod ?? order.paymentMethod ?? '';
  if (!method) return '';
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}
