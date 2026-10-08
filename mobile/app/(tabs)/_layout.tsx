import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../src/components/Icon';
import { useCart } from '../../src/context/CartContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';

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
  return <Icon name={name} size={23} color={String(color)} filled={focused} />;
}

function CartTabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
  const { cart } = useCart();
  const count = cart.totalQuantity;

  return (
    <View>
      <TabIcon name="cart" color={color} focused={focused} />
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

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? spacing.md : 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { height: 60 + bottomPad, paddingBottom: bottomPad }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
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
          tabBarIcon: (p) => <TabIcon name="wishlist" {...p} />,
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
  tabLabel: { ...typography.tiny, marginTop: 2 },
  header: { backgroundColor: colors.background },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
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
