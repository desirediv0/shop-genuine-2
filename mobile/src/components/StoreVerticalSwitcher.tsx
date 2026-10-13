import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoreVertical } from '../context/StoreVerticalContext';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { Icon } from './Icon';
import type { StoreVertical } from '../types';

/**
 * Top-of-screen sub-brand switcher.
 *
 * The four Genuine businesses stock completely different catalogues, so the
 * active one has to be unmistakable — hence a labelled bar rather than a row of
 * chips where the selection is easy to miss. Tapping opens a picker.
 */
export function StoreVerticalSwitcher() {
  const { vertical, verticals, select, loading } = useStoreVertical();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // Nothing to switch between until the admin creates verticals.
  if (loading || verticals.length === 0) return null;

  const label = vertical?.name ?? 'All Genuine stores';

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Shopping ${label}. Tap to change store.`}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <View style={styles.badge}>
          {vertical?.image ? (
            <Image source={vertical.image} style={styles.badgeImage} contentFit="cover" />
          ) : (
            <Icon name="store" size={17} color={colors.primary} />
          )}
        </View>

        <View style={styles.barText}>
          <Text style={styles.barCaption}>Shopping</Text>
          <Text style={styles.barLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>

        <Icon name="down" size={17} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>Choose a store</Text>
          <Text style={styles.sheetHint}>
            Each store has its own products, categories and brands.
          </Text>

          <ScrollView style={styles.options}>
            <Option
              label="All Genuine stores"
              caption="Everything in one place"
              selected={!vertical}
              onPress={() => {
                select(null);
                setOpen(false);
              }}
            />

            {verticals.map((v: StoreVertical) => (
              <Option
                key={v.id}
                label={v.name}
                image={v.image}
                selected={vertical?.id === v.id}
                onPress={() => {
                  select(v.id);
                  setOpen(false);
                }}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function Option({
  label,
  caption,
  image,
  selected,
  onPress,
}: {
  label: string;
  caption?: string;
  image?: string | null;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.optionBadge, selected && styles.optionBadgeSelected]}>
        {image ? (
          <Image source={image} style={styles.badgeImage} contentFit="cover" />
        ) : (
          <Icon
            name="store"
            size={19}
            color={selected ? colors.primary : colors.textSecondary}
          />
        )}
      </View>

      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {label}
        </Text>
        {caption ? <Text style={styles.optionCaption}>{caption}</Text> : null}
      </View>

      {selected ? <Icon name="check" size={19} color={colors.primary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: { width: '100%', height: '100%' },
  barText: { flex: 1 },
  barCaption: { ...typography.overline, color: colors.textMuted },
  barLabel: { ...typography.h3, color: colors.text, marginTop: 1 },

  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '75%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  sheetTitle: { ...typography.h2, color: colors.text },
  sheetHint: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  options: { marginTop: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeSelected: { backgroundColor: colors.primarySoft },
  optionText: { flex: 1 },
  optionLabel: { ...typography.h3, color: colors.text },
  optionLabelSelected: { color: colors.primary },
  optionCaption: { ...typography.small, color: colors.textMuted, marginTop: 1 },
});
