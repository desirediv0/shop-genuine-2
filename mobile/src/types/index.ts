/**
 * Types mirror the JSON the backend actually returns (verified against live
 * /api/v2 responses), not the Prisma models — the controllers reshape rows
 * before sending them.
 *
 * Note: Prisma Decimal columns serialise as strings, so price fields arrive as
 * `string | number` depending on the endpoint. Always run them through
 * `toNumber()` in src/utils/format.ts before doing arithmetic.
 */

export type Numeric = number | string;

export interface VariantAttribute {
  id: string;
  attributeValue?: {
    id: string;
    value: string;
    attribute?: { id: string; name: string };
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: Numeric;
  salePrice: Numeric | null;
  quantity: number;
  isActive: boolean;
  attributes: VariantAttribute[];
  images: { id: string; url: string; isPrimary: boolean }[];
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  featured: boolean;
  description?: string | null;
  image: string | null;
  images?: { id: string; url: string; isPrimary: boolean }[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
  variants: ProductVariant[];
  basePrice: number;
  regularPrice: number;
  hasSale: boolean;
  variantCount: number;
  reviewCount: number;
  avgRating?: number;
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  flashSale?: FlashSaleInfo | null;
}

export interface FlashSaleInfo {
  id: string;
  name: string;
  discountPercent?: number;
  endsAt?: string;
}

/**
 * A merchandising row on the home screen, managed in the admin under Product
 * Sections. Membership lives in ProductSectionItem — it is NOT the same thing
 * as the `Product.featured` boolean.
 */
export interface ProductSection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
  maxProducts: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductListResponse {
  products: ProductSummary[];
  pagination: Pagination;
  /**
   * Only `/public/categories/:slug/products` returns this. It carries the
   * category's real name — without it the screen can only de-slug the URL,
   * which turned "Biscuits & Cookies" into "biscuits  cookies".
   */
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  /** Often null — the admin does not require category artwork. */
  image?: string | null;
  productCount?: number;
  /**
   * Prisma relation count. Scoped to the selected sub-brand when the request
   * carries storeVerticalId, so it reflects what the shopper would actually see.
   */
  _count?: { products: number };
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface StoreVertical {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  order: number;
}

/**
 * Matches the Banner model: there is no flat `image` field — the server returns
 * separate desktop and mobile artwork, and either can be null.
 */
export interface Banner {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  desktopImage: string | null;
  mobileImage: string | null;
  link?: string | null;
}

export interface CartItem {
  id: string;
  quantity: number;
  price: number;
  originalPrice: number;
  subtotal: number;
  moq: number;
  cartItemType?: 'NORMAL' | 'BUNDLE';
  variant: {
    id: string;
    sku: string;
    attributes: VariantAttribute[];
  };
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    brand?: { id: string; name: string } | null;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'RETURN_APPROVED'
  | 'RETURN_COMPLETED';

/**
 * Order items arrive in two shapes. `/payment/orders` flattens them to `name`
 * and `image`; `/users/orders/:id` returns the snapshot fields (`productName`,
 * `productImage`) plus the live `product`. Read them through `orderItemName`
 * and `orderItemImage` in `utils/format` rather than any single field.
 */
export interface OrderItem {
  id: string;
  productId: string;
  name?: string;
  image?: string | null;
  productName?: string;
  productImage?: string | null;
  product?: {
    name?: string;
    images?: { url: string; isPrimary?: boolean }[];
  };
  price: Numeric;
  quantity: number;
  subtotal: Numeric;
  variant?: { id: string; sku: string; attributes?: VariantAttribute[] };
}

export interface Order {
  id: string;
  orderNumber: string;
  date?: string;
  createdAt?: string;
  status: OrderStatus;
  subTotal: Numeric;
  tax: Numeric;
  shippingCost: Numeric;
  discount: Numeric;
  codCharge?: Numeric;
  total: Numeric;
  couponCode?: string | null;
  /**
   * `/payment/orders` reports the specific instrument ("CARD", "CASH"); the
   * detail endpoint reports the gateway ("RAZORPAY") and carries the instrument
   * on `razorpayPayment`. Read both through `orderPaymentLabel`.
   */
  paymentMethod: string;
  razorpayPayment?: { paymentMethod?: string | null } | null;
  paymentStatus?: string;
  items: OrderItem[];
  shippingAddress?: Address | null;
  awbCode?: string | null;
  courierName?: string | null;
  shiprocketStatus?: string | null;
  tracking?: unknown;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  otpVerified: boolean;
  referralCode?: string | null;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaymentSettings {
  cashEnabled: boolean;
  razorpayEnabled: boolean;
  phonepeEnabled: boolean;
  codCharge: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug?: string;
  image?: string | null;
  price?: Numeric;
}
