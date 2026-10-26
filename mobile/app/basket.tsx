import React from 'react';
import { Stack } from 'expo-router';
import { useStoreVertical } from '../src/context/StoreVerticalContext';
import { storeTheme } from '../src/theme/stores';
import CartScreen from './(tabs)/cart';

/**
 * The cart, as a screen pushed on top of whatever the shopper was browsing.
 *
 * The Cart tab lives inside the tab navigator, so it can only be switched to,
 * not pushed — reaching it from a product page would throw away the page the
 * shopper was on. This route reuses the same screen so "View cart" opens the
 * cart and Back returns to the product, as in quick-commerce apps.
 *
 * The header takes the store tint, as the tab header does, so the cart's
 * <Backdrop> continues it instead of starting under a beige bar.
 */
export default function BasketScreen() {
  const { vertical } = useStoreVertical();
  return (
    <>
      <Stack.Screen options={{ headerStyle: { backgroundColor: storeTheme(vertical?.name).soft } }} />
      <CartScreen />
    </>
  );
}
