import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoreVertical } from '../context/StoreVerticalContext';
import { colors, radius, spacing, typography } from '../theme';
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
            <Text style={styles.badgeGlyph}>{vertical ? '🏷️' : '🛍️'}</Text>
          )}
        </View>

        <View style={styles.barText}>
          <Text style={styles.barCaption}>Shopping</Text>
          <Text style={styles.barLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>

        <Text style={styles.chevron}>▾</Text>
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
      <View style={styles.optionBadge}>
        {image ? (
          <Image source={image} style={styles.badgeImage} contentFit="cover" />
        ) : (
          <Text style={styles.badgeGlyph}>{caption ? '🛍️' : '🏷️'}</Text>
        )}
      </View>

      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {label}
        </Text>
        {caption ? <Text style={styles.optionCaption}>{caption}</Text> : null}
      </View>

      {selected ? <Text style={styles.tick}>✓</Text> : null}
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
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: { width: '100%', height: '100%' },
  badgeGlyph: { fontSize: 15 },
  barText: { flex: 1 },
  barCaption: { ...typography.tiny, color: colors.textMuted },
  barLabel: { ...typography.bodyStrong, color: colors.text },
  chevron: { ...typography.body, color: colors.textMuted, paddingHorizontal: spacing.xs },

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
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundAlt },
  optionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: { ...typography.bodyStrong, color: colors.text },
  optionLabelSelected: { color: colors.primary },
  optionCaption: { ...typography.tiny, color: colors.textMuted },
  tick: { ...typography.h3, color: colors.primary },
});
