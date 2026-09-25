import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../api/config';
import type { ProductSummary, ProductVariant } from '../types';
import { toNumber } from './format';

/**
 * The backend cart requires a token (server/routes/cart.routes.js does
 * `router.use(verifyJWTToken)`), so browsing shoppers get a local cart that is
 * merged into the server cart on sign-in — the same approach the web storefront
 * takes in client/src/lib/guest-cart-utils.js.
 */

export interface GuestCartLine {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  variantLabel: string;
  maxQuantity: number;
}

export async function readGuestCart(): Promise<GuestCartLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.guestCart);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GuestCartLine[]) : [];
  } catch {
    return [];
  }
}

async function writeGuestCart(lines: GuestCartLine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.guestCart, JSON.stringify(lines));
  } catch {
    // Storage full or unavailable — the in-memory cart still works this session.
  }
}

/**
 * Picks a thumbnail for the cart row.
 *
 * The list endpoint returns a flat `image`, but the product *detail* endpoint
 * only returns `images[]` — so reading `product.image` alone leaves a blank
 * thumbnail for anything added from a product page. Check every source.
 */
function resolveImage(
  product: ProductSummary,
  variant: ProductVariant,
): string | null {
  const variantPrimary =
    variant.images?.find((i) => i.isPrimary)?.url ?? variant.images?.[0]?.url;
  if (variantPrimary) return variantPrimary;

  if (product.image) return product.image;

  const productPrimary =
    product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url;
  return productPrimary ?? null;
}

export async function addGuestLine(
  product: ProductSummary,
  variant: ProductVariant,
  quantity: number,
  label: string,
): Promise<GuestCartLine[]> {
  const lines = await readGuestCart();
  const existing = lines.find((l) => l.productVariantId === variant.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, variant.quantity);
  } else {
    lines.push({
      productVariantId: variant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: resolveImage(product, variant),
      price: toNumber(variant.salePrice ?? variant.price),
      quantity: Math.min(quantity, variant.quantity),
      variantLabel: label,
      maxQuantity: variant.quantity,
    });
  }

  await writeGuestCart(lines);
  return lines;
}

export async function updateGuestLine(
  productVariantId: string,
  quantity: number,
): Promise<GuestCartLine[]> {
  let lines = await readGuestCart();
  if (quantity <= 0) {
    lines = lines.filter((l) => l.productVariantId !== productVariantId);
  } else {
    const line = lines.find((l) => l.productVariantId === productVariantId);
    if (line) line.quantity = Math.min(quantity, line.maxQuantity);
  }
  await writeGuestCart(lines);
  return lines;
}

export async function removeGuestLine(productVariantId: string): Promise<GuestCartLine[]> {
  const lines = (await readGuestCart()).filter(
    (l) => l.productVariantId !== productVariantId,
  );
  await writeGuestCart(lines);
  return lines;
}

export async function clearGuestCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.guestCart);
  } catch {
    // ignore
  }
}
