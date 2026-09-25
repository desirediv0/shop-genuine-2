import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, spacing, typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.done}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          If an account exists for {email.trim()}, we&apos;ve sent a link to reset your password.
          The link opens in your browser.
        </Text>
        <Button label="Back to sign in" fullWidth onPress={() => router.replace('/auth/login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter the email on your account and we&apos;ll send you a reset link.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Button label="Send reset link" fullWidth loading={submitting} onPress={onSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  done: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
  subtitle: { ...typography.small, color: colors.textMuted, lineHeight: 20 },
  form: { gap: spacing.lg, marginTop: spacing.xl },
});
