import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { spacing } from '../theme';
import type { Address } from '../types';

export type AddressDraft = Omit<Address, 'id' | 'userId'>;

const EMPTY: AddressDraft = {
  name: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
};

export function AddressForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<AddressDraft>;
  submitting?: boolean;
  onSubmit: (draft: AddressDraft) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<AddressDraft>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof AddressDraft) => (value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Enter a name';
    if (!draft.street.trim()) next.street = 'Enter the street address';
    if (!draft.city.trim()) next.city = 'Enter the city';
    if (!draft.state.trim()) next.state = 'Enter the state';
    if (!/^[1-9][0-9]{5}$/.test(draft.postalCode.trim())) {
      next.postalCode = 'Enter a valid 6-digit PIN code';
    }
    if (!/^[6-9][0-9]{9}$/.test(draft.phone.trim())) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Input
        label="Full name"
        value={draft.name}
        onChangeText={set('name')}
        error={errors.name}
        placeholder="Recipient name"
        autoComplete="name"
      />
      <Input
        label="Address"
        value={draft.street}
        onChangeText={set('street')}
        error={errors.street}
        placeholder="House / flat, street, area"
        multiline
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Input
            label="City"
            value={draft.city}
            onChangeText={set('city')}
            error={errors.city}
            placeholder="City"
          />
        </View>
        <View style={styles.half}>
          <Input
            label="State"
            value={draft.state}
            onChangeText={set('state')}
            error={errors.state}
            placeholder="State"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <Input
            label="PIN code"
            value={draft.postalCode}
            onChangeText={set('postalCode')}
            error={errors.postalCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="560001"
          />
        </View>
        <View style={styles.half}>
          <Input
            label="Phone"
            value={draft.phone}
            onChangeText={set('phone')}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="10-digit mobile"
          />
        </View>
      </View>

      <View style={styles.actions}>
        {onCancel ? (
          <Button label="Cancel" variant="ghost" onPress={onCancel} style={styles.flex} />
        ) : null}
        <Button
          label="Save address"
          loading={submitting}
          onPress={() => validate() && onSubmit(draft)}
          style={styles.flex}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
});
