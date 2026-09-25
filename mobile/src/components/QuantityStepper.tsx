import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}

export function QuantityStepper({ value, min = 1, max = 99, disabled, onChange }: Props) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        style={[styles.btn, !canDecrease && styles.btnDisabled]}
      >
        <Text style={styles.sign}>−</Text>
      </Pressable>

      <Text style={styles.value} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>

      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={[styles.btn, !canIncrease && styles.btnDisabled]}
      >
        <Text style={styles.sign}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  btn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  btnDisabled: { opacity: 0.4 },
  sign: { ...typography.h3, color: colors.text, lineHeight: 20 },
  value: {
    ...typography.bodyStrong,
    color: colors.text,
    minWidth: 36,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
});
