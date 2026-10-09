/**
 * The cart, as a screen pushed on top of whatever the shopper was browsing.
 *
 * The Cart tab lives inside the tab navigator, so it can only be switched to,
 * not pushed — reaching it from a product page would throw away the page the
 * shopper was on. This route reuses the same screen so "View cart" opens the
 * cart and Back returns to the product, as in quick-commerce apps.
 */
export { default } from './(tabs)/cart';
