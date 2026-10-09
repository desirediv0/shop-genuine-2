import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Diet } from '../../utils/productDetails';

const VEG = '#1B8A3E';
const NON_VEG = '#8B3A1E';

/**
 * The square-and-dot mark Indian food packaging carries: green for vegetarian,
 * brown for non-vegetarian. Shoppers here look for it before reading anything
 * else on a food product, so it sits beside the pack size.
 */
export function DietMark({ diet, size = 14 }: { diet: Diet; size?: number }) {
  const color = diet === 'veg' ? VEG : NON_VEG;
  return (
    <View
      accessible
      accessibilityLabel={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
      style={[styles.box, { width: size, height: size, borderColor: color }]}
    >
      <View
        style={{
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: size,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
});
