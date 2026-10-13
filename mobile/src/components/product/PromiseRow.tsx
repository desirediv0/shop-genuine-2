import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
export function PromiseRow() {
  // Same key as checkout, so this is usually already cached.
  const settingsQ = useQuery({ queryKey: ['paymentSettings'], queryFn: () => payments.settings() });
  const settings = settingsQ.data;

  const payment: { icon: IconName; label: string } | null = settings?.cashEnabled
    ? { icon: 'cash', label: 'Cash on delivery' }
    : settings?.razorpayEnabled
      ? { icon: 'card', label: 'Secure payments' }
      : null;

  const items: { icon: IconName; label: string }[] = [
    { icon: 'shield', label: '100% authentic' },
    { icon: 'truck', label: 'Delivery across India' },
    ...(payment ? [payment] : []),
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.iconWrap}>
            <Icon name={item.icon} size={18} color={colors.primary} />
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
  row: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: spacing.xs },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.tiny, color: colors.text, textAlign: 'center' },
});
