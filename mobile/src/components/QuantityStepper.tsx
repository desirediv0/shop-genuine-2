import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Icon } from './Icon';

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
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        style={({ pressed }) => [styles.btn, pressed && canDecrease && styles.pressed]}
      >
        <Icon
          name="minus"
          size={16}
          color={canDecrease ? colors.text : colors.textMuted}
        />
      </Pressable>

      <Text style={styles.value} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>

      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [styles.btn, pressed && canIncrease && styles.pressed]}
      >
        <Icon name="plus" size={16} color={canIncrease ? colors.text : colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    padding: 3,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.border },
  value: {
    ...typography.bodyStrong,
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
});
