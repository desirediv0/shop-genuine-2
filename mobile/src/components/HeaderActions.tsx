import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { colors, fonts, radius } from '../theme';
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
export function HeaderActions() {
  const router = useRouter();
  const { cart } = useCart();
  const count = cart.totalQuantity;

  return (
    <View style={styles.row}>
      <HeaderIcon
        name="search"
        label="Search products"
        // Back to the tabs' Search screen rather than stacking a second copy
        // of the tab navigator on top of this one.
        onPress={() => router.dismissTo('/search')}
      />
      <HeaderIcon
        name="cart"
        label={count > 0 ? `Cart, ${count} items` : 'Cart'}
        count={count}
        onPress={() => router.push('/basket')}
      />
    </View>
  );
}

function HeaderIcon({
  name,
  label,
  count = 0,
  onPress,
}: {
  name: IconName;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
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
  btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
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
  badgeText: { fontFamily: fonts.bold, fontSize: 9, lineHeight: 12, color: colors.textInverse },
});
