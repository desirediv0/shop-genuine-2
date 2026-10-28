import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { colors, fonts, radius, spacing } from '../theme';
import { Icon, type IconName } from './Icon';

/**
 * Search and cart shortcuts for the header of pages that sit outside the tab
 * bar — product and category pages.
 *
 * Those pages used to offer only Back, so reaching the cart from three
 * products deep meant backing out one screen at a time. Akash ruled out
 * putting the whole tab bar on every page; two icons in the header, as
 * quick-commerce apps do, cover the two places people actually want to go.
 */
export function HeaderActions({ floating = false }: { floating?: boolean }) {
  const router = useRouter();
  const { cart } = useCart();
  const count = cart.totalQuantity;

  return (
    <View style={[styles.row, floating && styles.rowFloating]}>
      <HeaderIcon
        name="search"
        label="Search products"
        floating={floating}
        // Back to the tabs' Search screen rather than stacking a second copy
        // of the tab navigator on top of this one.
        onPress={() => router.dismissTo('/search')}
      />
      <HeaderIcon
        name="cart"
        label={count > 0 ? `Cart, ${count} items` : 'Cart'}
        count={count}
        floating={floating}
        onPress={() => router.push('/basket')}
      />
    </View>
  );
}

/**
 * Back, as a white disc — for pages whose header floats over a picture
 * (the product page), where a bare arrow would sit on the photo.
 */
export function FloatingBack() {
  const router = useRouter();
  return (
    <HeaderIcon
      name="back"
      label="Back"
      floating
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}

function HeaderIcon({
  name,
  label,
  count = 0,
  floating = false,
  onPress,
}: {
  name: IconName;
  label: string;
  count?: number;
  /** A white disc with a shadow, for headers laid over a picture. */
  floating?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, floating && styles.btnFloating, pressed && styles.pressed]}
    >
      <Icon name={name} size={22} color={colors.text} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rowFloating: { gap: spacing.sm },
  btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  // A hairline rather than a shadow: the native header clips anything drawn
  // outside a button's box, which turned a soft shadow into a grey square.
  btnFloating: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  // Same badge as the tab bar's, so a count looks the same wherever it shows.
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: { fontFamily: fonts.display, fontSize: 9, lineHeight: 12, color: colors.textInverse },
});
