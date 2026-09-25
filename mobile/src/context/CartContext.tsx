import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cart as cartApi } from '../api/services';
import type { Cart, CartItem, ProductSummary, ProductVariant } from '../types';
import { useAuth } from './AuthContext';
import {
  addGuestLine,
  clearGuestCart,
  readGuestCart,
  removeGuestLine,
  updateGuestLine,
  type GuestCartLine,
} from '../utils/guestCart';
import { variantLabel } from '../utils/format';

const EMPTY: Cart = { items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 };

/** Presents a guest line in the same shape as a server cart item. */
function guestLinesToCart(lines: GuestCartLine[]): Cart {
  const items: CartItem[] = lines.map((l) => ({
    id: `guest:${l.productVariantId}`,
    quantity: l.quantity,
    price: l.price,
    originalPrice: l.price,
    subtotal: l.price * l.quantity,
    moq: 1,
    cartItemType: 'NORMAL',
    variant: { id: l.productVariantId, sku: '', attributes: [] },
    product: {
      id: l.productId,
      name: l.name,
      slug: l.slug,
      image: l.image,
      brand: null,
    },
  }));

  return {
    items,
    subtotal: items.reduce((sum, i) => sum + i.subtotal, 0),
    itemCount: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  /** True while a mutation is in flight, for disabling buttons. */
  mutating: boolean;
  isGuestCart: boolean;
  refresh: () => Promise<void>;
  addItem: (
    product: ProductSummary,
    variant: ProductVariant,
    quantity?: number,
  ) => Promise<void>;
  updateItem: (item: CartItem, quantity: number) => Promise<void>;
  removeItem: (item: CartItem) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialising } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const loadGuest = useCallback(async () => {
    setCart(guestLinesToCart(await readGuestCart()));
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      await loadGuest();
      return;
    }
    setLoading(true);
    try {
      setCart(await cartApi.get());
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadGuest]);

  /**
   * On sign-in, push any locally held lines up to the server cart, then drop
   * the local copy. Failures per line are swallowed deliberately: a single
   * out-of-stock item should not block the rest of the merge.
   */
  const mergeGuestCart = useCallback(async () => {
    const lines = await readGuestCart();
    if (!lines.length) return;

    for (const line of lines) {
      try {
        await cartApi.add(line.productVariantId, line.quantity);
      } catch {
        // skip unavailable line
      }
    }
    await clearGuestCart();
  }, []);

  useEffect(() => {
    if (initialising) return;

    (async () => {
      if (isAuthenticated) {
        await mergeGuestCart();
      }
      await refresh();
    })();
  }, [isAuthenticated, initialising, mergeGuestCart, refresh]);

  const addItem = useCallback(
    async (product: ProductSummary, variant: ProductVariant, quantity = 1) => {
      setMutating(true);
      try {
        if (isAuthenticated) {
          await cartApi.add(variant.id, quantity);
          await refresh();
        } else {
          const lines = await addGuestLine(
            product,
            variant,
            quantity,
            variantLabel(variant.attributes),
          );
          setCart(guestLinesToCart(lines));
        }
      } finally {
        setMutating(false);
      }
    },
    [isAuthenticated, refresh],
  );

  const updateItem = useCallback(
    async (item: CartItem, quantity: number) => {
      setMutating(true);
      try {
        if (isAuthenticated) {
          await cartApi.update(item.id, quantity);
          await refresh();
        } else {
          const lines = await updateGuestLine(item.variant.id, quantity);
          setCart(guestLinesToCart(lines));
        }
      } finally {
        setMutating(false);
      }
    },
    [isAuthenticated, refresh],
  );

  const removeItem = useCallback(
    async (item: CartItem) => {
      setMutating(true);
      try {
        if (isAuthenticated) {
          await cartApi.remove(item.id);
          await refresh();
        } else {
          const lines = await removeGuestLine(item.variant.id);
          setCart(guestLinesToCart(lines));
        }
      } finally {
        setMutating(false);
      }
    },
    [isAuthenticated, refresh],
  );

  const clear = useCallback(async () => {
    setMutating(true);
    try {
      if (isAuthenticated) {
        await cartApi.clear();
      } else {
        await clearGuestCart();
      }
      setCart(EMPTY);
    } finally {
      setMutating(false);
    }
  }, [isAuthenticated]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      mutating,
      isGuestCart: !isAuthenticated,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, mutating, isAuthenticated, refresh, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
