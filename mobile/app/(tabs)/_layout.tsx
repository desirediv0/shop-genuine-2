import React, { useEffect, useRef } from 'react';
import { Tabs, useSegments } from 'expo-router';
import { PlatformPressable } from 'expo-router/react-navigation';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
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
  active,
}: {
  name: IconName;
  // react-navigation hands us a ColorValue, not a plain string.
  color: ColorValue;
  focused: boolean;
  /** Whether this tab is the selected one — see TabsLayout. */
  active: boolean;
}) {
  // The pill grows in behind the icon and the icon gives a small hop when the
  // tab is chosen, instead of both snapping into place.
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
  active,
}: {
  name: IconName;
  count: number;
  color: ColorValue;
  focused: boolean;
  active: boolean;
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
      <TabIcon name={name} color={color} focused={focused} active={active} />
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

function CartTabIcon(p: { color: ColorValue; focused: boolean; active: boolean }) {
  const { cart } = useCart();
  return <CountTabIcon name="cart" count={cart.totalQuantity} {...p} />;
}

/**
 * Saving a product used to leave this tab unchanged, so there was no sign the
 * tap had worked. The count comes from the same query the Save button
 * invalidates, so it updates the moment a product is saved or removed.
 */
function SavedTabIcon(p: { color: ColorValue; focused: boolean; active: boolean }) {
  const { count } = useWishlist();
  return <CountTabIcon name="wishlist" count={count} {...p} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Cart, Saved and Account paint a <Backdrop> that starts in this colour, so
  // the header and the wash below it read as one tinted area.
  const { vertical } = useStoreVertical();
  const tint = storeTheme(vertical?.name).soft;
  // The bar floats: a white pill held off the screen edges, clear of the
  // gesture area, instead of a slab across the bottom.
  const bottomGap = Math.max(insets.bottom, spacing.sm) + spacing.xs;

  // Which tab is selected, for the icon pills. An icon's `focused` prop cannot
  // say: the tab bar draws every icon twice — once focused, once not — and
  // switches tabs by swapping which copy shows, so neither copy's prop ever
  // changes. Reading the navigator from inside an icon went stale too, since an
  // icon whose props do not change is never re-rendered. The route is read
  // here instead, which re-renders every icon with the answer — right from
  // launch, whichever tab the app opens on. While a screen is pushed over the
  // tabs (product, checkout) the last tab is kept, so the pills hold still.
  const segments = useSegments();
  const lastTab = useRef('index');
  if (segments[0] === '(tabs)') lastTab.current = segments[1] ?? 'index';
  const activeTab = lastTab.current;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { marginBottom: bottomGap }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        // No grey ripple on Android: it spread past the bar and muddied the
        // pill, which is the press feedback now.
        tabBarButton: (props) => <PlatformPressable {...props} pressColor="transparent" />,
        headerStyle: [styles.header, { backgroundColor: tint }],
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: (p) => <TabIcon name="home" {...p} active={activeTab === 'index'} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: (p) => <TabIcon name="search" {...p} active={activeTab === 'search'} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: (p) => <CartTabIcon {...p} active={activeTab === 'cart'} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Saved',
          tabBarIcon: (p) => <SavedTabIcon {...p} active={activeTab === 'wishlist'} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: (p) => <TabIcon name="account" {...p} active={activeTab === 'account'} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 66,
    marginHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 26,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    ...shadow.raised,
  },
  tabItem: { paddingTop: 0 },
  tabLabel: { ...typography.tiny, fontFamily: fonts.displayBold, marginTop: 3 },
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
    fontFamily: fonts.display,
    fontSize: 9,
    lineHeight: 12,
    color: colors.textInverse,
  },
});
