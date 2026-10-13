import { useWindowDimensions } from 'react-native';
import { spacing } from '../theme';

/**
 * Card sizes for product grids and horizontal rows, worked out in one place so
 * every screen agrees.
 *
 * Cards used to be half the screen wide (~184dp on a typical phone), which put
 * only two products in view and made each one taller than a thumb's reach.
 * Grocery shoppers scan many small items quickly, so grids are three across on
 * any phone 360dp or wider — the same density quick-commerce apps use — and
 * fall back to two on very narrow screens where a third column would crush
 * the price.
 *
 * Rows show a little over three cards, so the next one peeks in from the edge:
 * that is the cue that the row scrolls sideways.
 */
export function useProductLayout() {
  const { width } = useWindowDimensions();
  const gutter = spacing.lg;
  const gap = spacing.sm;

  const columns = width >= 360 ? 3 : 2;
  const gridCardWidth = Math.floor((width - gutter * 2 - gap * (columns - 1)) / columns);
  const railCardWidth = Math.floor((width - gutter - gap * 3) / 3.2);

  return { columns, gridCardWidth, railCardWidth, gutter, gap };
}
