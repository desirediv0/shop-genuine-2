import React, { useEffect, useRef } from 'react';
import { Tabs, useRoute } from 'expo-router';
import { PlatformPressable, useNavigationState } from 'expo-router/react-navigation';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
  // The pill grows in behind the icon and the icon gives a small hop when the
  // tab is chosen, instead of both snapping into place.
  //
  // `focused` cannot drive this: the tab bar draws every icon twice — once with
  // focused true, once false — and switches tabs by swapping which copy shows,
  // so neither copy's prop ever changes. Both copies read the real selection
  // from the tab navigator instead (a pushed screen does not change it), so
  // whichever copy is showing animates.
  const route = useRoute();
  const active = useNavigationState((s) => s.routes[s.index]?.key === route.key);
  const pill = useSharedValue(active ? 1 : 0);
  const hop = useSharedValue(0);
  useEffect(() => {
    pill.value = withSpring(active ? 1 : 0, { damping: 15, stiffness: 220 });
    if (active) {
      hop.value = withSequence(withTiming(-3, { duration: 110 }), withSpring(0, { damping: 9, stiffness: 260 }));
    }
  }, [active, pill, hop]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pill.value,
    transform: [{ scaleX: 0.55 + pill.value * 0.45 }],
  }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.value }] }));

  return (
    // A soft pill behind the active icon — where you are reads at a glance,
    // and the bar looks designed rather than default.
    <View style={styles.iconPill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.iconPillActive, pillStyle]} />
      <Animated.View style={iconStyle}>
        <Icon name={name} size={22} color={String(color)} filled={focused} />
      </Animated.View>
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
  // The badge pops whenever the number changes, so adding to the cart (or
  // saving) is seen to land even from another screen.
  const pop = useSharedValue(1);
  const previous = useRef(count);
  useEffect(() => {
    if (count !== previous.current && count > 0) {
      pop.value = withSequence(withTiming(1.45, { duration: 120 }), withSpring(1, { damping: 8, stiffness: 240 }));
    }
    previous.current = count;
  }, [count, pop]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View>
      <TabIcon name={name} color={color} focused={focused} />
      {count > 0 ? (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {count > 9 ? '9+' : count}
          </Text>
        </Animated.View>
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
        // No grey ripple on Android: it spread past the bar and muddied the
        // pill, which is the press feedback now.
        tabBarButton: (props) => <PlatformPressable {...props} pressColor="transparent" />,
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
  iconPillActive: { backgroundColor: colors.primarySoft, borderRadius: radius.pill },
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
