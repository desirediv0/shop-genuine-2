import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../src/components/Icon';
import { useCart } from '../../src/context/CartContext';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useWishlist } from '../../src/hooks/useWishlist';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import { storeTheme } from '../../src/theme/stores';

/**
 * Tab icons switch from outline to solid when active — the standard cue that
 * reads instantly without relying on colour alone.
 */
function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  // react-navigation hands us a ColorValue, not a plain string.
  color: ColorValue;
  focused: boolean;
}) {
  return (
    // A soft pill behind the active icon — where you are reads at a glance,
    // and the bar looks designed rather than default.
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Icon name={name} size={22} color={String(color)} filled={focused} />
    </View>
  );
}

/** A tab icon with a count bubble, shared by Cart and Saved so they match. */
function CountTabIcon({
  name,
  count,
  color,
  focused,
}: {
  name: IconName;
  count: number;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View>
      <TabIcon name={name} color={color} focused={focused} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CartTabIcon(p: { color: ColorValue; focused: boolean }) {
  const { cart } = useCart();
  return <CountTabIcon name="cart" count={cart.totalQuantity} {...p} />;
}

/**
 * Saving a product used to leave this tab unchanged, so there was no sign the
 * tap had worked. The count comes from the same query the Save button
 * invalidates, so it updates the moment a product is saved or removed.
 */
function SavedTabIcon(p: { color: ColorValue; focused: boolean }) {
  const { count } = useWishlist();
  return <CountTabIcon name="wishlist" count={count} {...p} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Cart, Saved and Account paint a <Backdrop> that starts in this colour, so
  // the header and the wash below it read as one tinted area.
  const { vertical } = useStoreVertical();
  const tint = storeTheme(vertical?.name).soft;
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? spacing.md : 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { height: 60 + bottomPad, paddingBottom: bottomPad }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: [styles.header, { backgroundColor: tint }],
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 20 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: (p) => <TabIcon name="home" {...p} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: (p) => <TabIcon name="search" {...p} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: (p) => <CartTabIcon {...p} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Saved',
          tabBarIcon: (p) => <SavedTabIcon {...p} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: (p) => <TabIcon name="account" {...p} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    ...shadow.bar,
  },
  tabItem: { paddingTop: 2 },
  tabLabel: { ...typography.tiny, fontFamily: fonts.semibold, marginTop: 3 },
  iconPill: {
    width: 54,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: colors.primarySoft },
  header: { backgroundColor: colors.background },
  badge: {
    position: 'absolute',
    top: -3,
    right: 6,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Separates the badge from the icon beneath it.
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
    color: colors.textInverse,
  },
});
