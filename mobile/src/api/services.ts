import { api } from './client';
import type {
  Address,
  AuthPayload,
  Banner,
  Brand,
  Cart,
  Category,
  Order,
  PaymentSettings,
  ProductListResponse,
  ProductSummary,
  StoreVertical,
  User,
  WishlistItem,
} from '../types';

/* ------------------------------ Catalogue ------------------------------ */

/** Narrows a catalogue request to one sub-brand; empty object means "All". */
export interface VerticalScope {
  storeVerticalId?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  gender?: string;
  storeVerticalId?: string;
  attributeValueIds?: string;
}

export const catalogue = {
  products: (q: ProductQuery = {}) =>
    api.get<ProductListResponse>('/public/products', q as Record<string, unknown>),

  /** Also returns relatedProducts from the same category. */
  productBySlug: (slug: string) =>
    api.get<{ product: ProductSummary; relatedProducts: ProductSummary[] }>(
      `/public/products/${slug}`,
    ),

  maxPrice: () => api.get<{ maxPrice: number }>('/public/products/max-price'),

  /**
   * Pass storeVerticalId to scope the list to one sub-brand. The server derives
   * a vertical's categories from the products assigned to it, so this returns
   * only categories that actually stock something in that store.
   */
  categories: (q: VerticalScope = {}) =>
    api.get<{ categories: Category[] }>('/public/categories', q as Record<string, unknown>),

  categoriesWithSubs: (q: VerticalScope = {}) =>
    api.get<{ categories: Category[] }>(
      '/public/categories-with-subcategories',
      q as Record<string, unknown>,
    ),

  /** Accepts storeVerticalId so drilling into a category stays in the sub-brand. */
  productsByCategory: (slug: string, q: ProductQuery = {}) =>
    api.get<ProductListResponse>(
      `/public/categories/${slug}/products`,
      q as Record<string, unknown>,
    ),

  productsBySubCategory: (slug: string, q: ProductQuery = {}) =>
    api.get<ProductListResponse>(
      `/public/subcategories/${slug}/products`,
      q as Record<string, unknown>,
    ),

  /** Also derived from products, so each sub-brand lists only what it stocks. */
  brands: (q: VerticalScope = {}) =>
    api.get<{ brands: Brand[] }>('/public/brands', q as Record<string, unknown>),

  storeVerticals: () => api.get<{ storeVerticals: StoreVertical[] }>('/public/store-verticals'),

  banners: () => api.get<{ banners: Banner[] }>('/public/banners'),

  flashSales: () => api.get<unknown>('/public/flash-sales'),

  productSections: () => api.get<unknown>('/public/product-sections'),

  filterAttributes: () => api.get<unknown>('/public/filter-attributes'),

  videoReels: () => api.get<unknown>('/public/video-reels'),

  priceVisibility: () =>
    api.get<{ hidePricesForGuests: boolean }>('/public/price-visibility-settings'),
};

/* --------------------------------- Auth -------------------------------- */

export const auth = {
  register: (body: { name: string; email: string; password: string; phone?: string; referralCode?: string }) =>
    api.post<User & { emailSent: boolean; debugOtp?: string }>('/users/register', body),

  login: (body: { email: string; password: string }) =>
    api.post<AuthPayload>('/users/login', body),

  /** Verifying the OTP also signs the user in and returns both tokens. */
  verifyOtp: (body: { email: string; otp: string }) =>
    api.post<AuthPayload>('/users/verify-otp', body),

  resendVerification: (body: { email: string }) =>
    api.post<unknown>('/users/resend-verification', body),

  forgotPassword: (body: { email: string }) =>
    api.post<unknown>('/users/forgot-password', body),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.post<unknown>('/users/change-password', body),

  me: () => api.get<{ user: User }>('/users/me'),

  logout: () => api.post<unknown>('/users/logout'),

  requestAccountDeletion: () => api.post<unknown>('/users/request-account-deletion'),

  /**
   * Deletes the account in one call. Apple requires deletion to be completable
   * in the app, so this replaces the emailed-link flow on mobile.
   * Password is required for accounts that have one; others confirm with
   * confirmText: 'DELETE'.
   */
  deleteAccount: (body: { password?: string; confirmText?: string }) =>
    api.post<unknown>('/users/delete-account', body),
};

/* ------------------------------- Addresses ------------------------------ */

export const addresses = {
  list: () => api.get<{ addresses: Address[] }>('/users/addresses'),
  create: (body: Omit<Address, 'id' | 'userId'>) =>
    api.post<{ address: Address }>('/users/addresses', body),
  update: (id: string, body: Partial<Address>) =>
    api.patch<{ address: Address }>(`/users/addresses/${id}`, body),
  setDefault: (id: string) => api.patch<unknown>(`/users/addresses/${id}/default`, {}),
  remove: (id: string) => api.delete<unknown>(`/users/addresses/${id}`),
};

/* --------------------------------- Cart -------------------------------- */

export const cart = {
  get: () => api.get<Cart>('/cart'),
  add: (productVariantId: string, quantity = 1) =>
    api.post<unknown>('/cart/add', { productVariantId, quantity }),
  update: (cartItemId: string, quantity: number) =>
    api.patch<unknown>(`/cart/update/${cartItemId}`, { quantity }),
  remove: (cartItemId: string) => api.delete<unknown>(`/cart/remove/${cartItemId}`),
  clear: () => api.delete<unknown>('/cart/clear'),
  validate: () =>
    api.post<{ valid: boolean; subTotal: number; itemCount: number }>('/cart/validate', {}),
};

/* ------------------------------- Wishlist ------------------------------ */

export const wishlist = {
  list: () => api.get<{ wishlistItems: WishlistItem[] }>('/users/wishlist'),
  add: (productId: string) => api.post<unknown>('/users/wishlist', { productId }),
  remove: (wishlistItemId: string) =>
    api.delete<unknown>(`/users/wishlist/${wishlistItemId}`),
};

/* ------------------------------- Payments ------------------------------ */

export const payments = {
  settings: () => api.get<PaymentSettings>('/payment/settings'),

  razorpayKey: () => api.get<{ key: string | null }>('/payment/razorpay-key'),

  /** Creates a Razorpay order; returns the order to hand to the checkout SDK. */
  checkout: (body: { couponCode?: string; couponId?: string; storeVerticalId?: string }) =>
    api.post<{
      id: string;
      amount: number;
      currency: string;
      serverCalculatedAmount: number;
      shippingCost: number;
    }>('/payment/checkout', { paymentGateway: 'RAZORPAY', ...body }),

  /**
   * Mirrors the payload the web checkout sends (client/src/app/checkout/page.js),
   * so both clients produce identical orders. The server re-derives the amount
   * from the cart regardless — these coupon fields only affect what it records.
   */
  verify: (body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    shippingAddressId: string;
    billingAddressSameAsShipping?: boolean;
    couponCode?: string | null;
    couponId?: string | null;
    discountAmount?: number;
    storeVerticalId?: string | null;
  }) => api.post<{ orderId: string; orderNumber: string }>('/payment/verify', body),

  /** Same payload shape as the web checkout, so both clients record orders alike. */
  cashOrder: (body: {
    shippingAddressId: string;
    billingAddressSameAsShipping?: boolean;
    couponCode?: string | null;
    couponId?: string | null;
    discountAmount?: number;
    storeVerticalId?: string | null;
  }) =>
    api.post<{ orderId: string; orderNumber: string; paymentMethod: string }>(
      '/payment/cash-order',
      body,
    ),

  orders: () => api.get<{ orders: Order[] }>('/payment/orders'),
  orderById: (id: string) => api.get<{ order: Order } | Order>(`/payment/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    api.post<unknown>(`/payment/orders/${id}/cancel`, { reason }),
};

/* -------------------------------- Orders ------------------------------- */

export const orders = {
  list: () => api.get<{ orders: Order[] }>('/users/orders'),
  byId: (id: string) => api.get<{ order: Order }>(`/users/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    api.post<unknown>(`/users/orders/${id}/cancel`, { reason }),
};

/* -------------------------------- Coupons ------------------------------ */

export interface CouponVerifyResult {
  valid: boolean;
  coupon: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: string | number;
    /** Server returns these as fixed-2 strings. */
    discountAmount: string;
    applicableSubtotal: string;
    matchedItems: number;
    finalAmount: string;
  };
}

export const coupons = {
  /**
   * Passing cartItems lets the server scope the discount to matching products
   * when the coupon targets specific categories/products/brands.
   */
  verify: (body: {
    code: string;
    cartTotal: number;
    cartItems?: { productId: string; productVariantId: string; price: number; quantity: number }[];
  }) => api.post<CouponVerifyResult>('/coupons/verify', body),

  apply: (code: string) => api.post<unknown>('/coupons/apply', { code }),
};

/* -------------------------------- Returns ------------------------------ */

export const returns = {
  settings: () => api.get<unknown>('/returns/settings'),
  reasons: () => api.get<unknown>('/returns/reasons'),
  mine: () => api.get<{ returnRequests: unknown[] }>('/returns/my-returns'),
  create: (body: Record<string, unknown>) => api.post<unknown>('/returns', body),
};

/* --------------------------- Content & extras -------------------------- */

export const content = {
  faqs: () => api.get<unknown>('/faqs'),
  page: (slug: string) => api.get<unknown>(`/content/pages/${slug}`),
  contact: (body: Record<string, unknown>) => api.post<unknown>('/content/contact', body),
};

export const referrals = {
  myCode: () =>
    api.get<{ referralCode: string; stats: Record<string, unknown> }>('/referrals/my-code'),
  mine: () => api.get<unknown>('/referrals/my-referrals'),
};

export const bundles = {
  list: () => api.get<unknown>('/bundles'),
  bySlug: (slug: string) => api.get<unknown>(`/bundles/${slug}`),
};

/* ----------------------------- Notifications ---------------------------- */

export const notifications = {
  /** Idempotent — safe to call on every cold start. */
  registerDevice: (body: {
    token: string;
    platform?: string;
    deviceName?: string;
    appVersion?: string;
  }) => api.post<{ device: { id: string } }>('/notifications/register-device', body),

  unregisterDevice: (token: string) =>
    api.post<unknown>('/notifications/unregister-device', { token }),

  devices: () =>
    api.get<{ devices: { id: string; platform: string | null; deviceName: string | null }[] }>(
      '/notifications/devices',
    ),

  sendTest: () => api.post<{ accepted: number }>('/notifications/test'),
};

export const newsletter = {
  subscribe: (email: string) => api.post<unknown>('/newsletter/subscribe', { email }),
};
