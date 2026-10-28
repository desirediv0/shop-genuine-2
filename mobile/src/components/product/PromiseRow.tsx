import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { payments } from '../../api/services';
import { colors, radius, spacing, typography } from '../../theme';
import { Icon, type IconName } from '../Icon';

/**
 * Three reassurances under the price. Every claim here has to be true of this
 * store: authenticity is the brand's own promise, delivery coverage matches the
 * home-screen tagline, and the payment item follows what the admin has actually
 * switched on — Cash on Delivery only appears while COD is enabled.
 *
 * Deliberately not "Free delivery" or "Easy returns": those are policies the
 * business has not published, and a product page is no place to invent them.
 * (The website's equivalent still carries the old perfume shop's wording.)
 */
interface Item {
  icon: IconName;
  label: string;
  fg: string;
  bg: string;
}

/** One colour per promise, so the three read as distinct at a glance. */
const TONES = {
  green: { fg: colors.success, bg: colors.successSoft },
  blue: { fg: colors.deal, bg: colors.dealSoft },
  orange: { fg: colors.primaryDeep, bg: colors.primarySoft },
};

export function PromiseRow({ style }: { style?: StyleProp<ViewStyle> } = {}) {
  // Same key as checkout, so this is usually already cached.
  const settingsQ = useQuery({ queryKey: ['paymentSettings'], queryFn: () => payments.settings() });
  const settings = settingsQ.data;

  const payment: Item | null = settings?.cashEnabled
    ? { icon: 'cash', label: 'Cash on delivery', ...TONES.orange }
    : settings?.razorpayEnabled
      ? { icon: 'card', label: 'Secure payments', ...TONES.orange }
      : null;

  const items: Item[] = [
    { icon: 'shield', label: '100% authentic', ...TONES.green },
    { icon: 'truck', label: 'Delivery across India', ...TONES.blue },
    ...(payment ? [payment] : []),
  ];

  return (
    <View style={[styles.row, style]}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
            <Icon name={item.icon} size={19} color={item.fg} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.md },
  item: { flex: 1, alignItems: 'center', gap: 8, paddingHorizontal: spacing.xs },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.tiny, fontFamily: typography.smallStrong.fontFamily, color: colors.text, textAlign: 'center' },
});
