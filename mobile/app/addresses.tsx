import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addresses as addressApi } from '../src/api/services';
import { AddressForm, type AddressDraft } from '../src/components/AddressForm';
import { Button } from '../src/components/Button';
import { EmptyState, ErrorState, LoadingState } from '../src/components/States';
import { useToast } from '../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { Address } from '../src/types';

export default function AddressesScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);

  const query = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const create = useMutation({
    mutationFn: (draft: AddressDraft) => addressApi.create(draft),
    onSuccess: () => {
      invalidate();
      setCreating(false);
      toast('Address added', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const update = useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: AddressDraft }) =>
      addressApi.update(id, draft),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast('Address updated', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => addressApi.setDefault(id),
    onSuccess: () => {
      invalidate();
      toast('Default address updated', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast('Address removed', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (query.isLoading) return <LoadingState label="Loading addresses…" />;
  if (query.isError) {
    return <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />;
  }

  const list = query.data?.addresses ?? [];

  const confirmDelete = (a: Address) => {
    Alert.alert('Remove address', `Remove the address for ${a.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(a.id) },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Saved addresses' }} />

      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No addresses saved" message="Add one to speed up checkout." />
        }
        ListFooterComponent={
          <Button
            label="Add a new address"
            variant="outline"
            fullWidth
            onPress={() => setCreating(true)}
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.isDefault && styles.cardDefault]}>
            <View style={styles.cardHead}>
              <Text style={styles.name}>{item.name}</Text>
              {item.isDefault ? (
                <View style={styles.defaultPill}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.meta}>
              {item.street}, {item.city}, {item.state} {item.postalCode}
            </Text>
            <Text style={styles.meta}>{item.phone}</Text>

            <View style={styles.actions}>
              <Pressable onPress={() => setEditing(item)} hitSlop={8}>
                <Text style={styles.action}>Edit</Text>
              </Pressable>
              {!item.isDefault ? (
                <Pressable onPress={() => setDefault.mutate(item.id)} hitSlop={8}>
                  <Text style={styles.action}>Set as default</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                <Text style={[styles.action, styles.danger]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal
        visible={creating || !!editing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{editing ? 'Edit address' : 'New address'}</Text>
          <AddressForm
            initial={editing ?? undefined}
            submitting={create.isPending || update.isPending}
            onSubmit={(draft) =>
              editing ? update.mutate({ id: editing.id, draft }) : create.mutate(draft)
            }
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  cardDefault: { borderColor: colors.primary },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { ...typography.small, color: colors.text, fontWeight: '700' },
  defaultPill: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  defaultText: { ...typography.tiny, color: colors.primary, fontWeight: '700' },
  meta: { ...typography.small, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  action: { ...typography.small, color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error },
  modal: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  modalTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
});
