import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, spacing, typography } from '../../src/theme';

/**
 * Mirrors server/helper/validatePassword.js exactly, so the user sees the
 * problem here instead of getting a 400 back from the server.
 */
function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Use at least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Include a special character (e.g. @ or !)';
  return null;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter your name';
    if (!form.email.trim()) next.email = 'Enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone.trim())) {
      next.phone = 'Enter a 10-digit phone number';
    }
    const pw = passwordProblem(form.password);
    if (pw) next.password = pw;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      toast('Account created. Check your email for the code.', 'success');
      router.replace({ pathname: '/auth/verify', params: { email: form.email.trim() } });
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          We&apos;ll email you a 6-digit code to confirm it&apos;s you.
        </Text>

        <View style={styles.form}>
          <Input
            label="Full name"
            value={form.name}
            onChangeText={set('name')}
            error={errors.name}
            autoComplete="name"
            textContentType="name"
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={form.email}
            onChangeText={set('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
          />
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChangeText={set('phone')}
            error={errors.phone}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="10-digit number"
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={set('password')}
            error={errors.password}
            hint="8+ characters with upper and lower case, a number, and a special character."
            secure
            autoCapitalize="none"
            textContentType="newPassword"
            placeholder="Create a password"
          />

          <Button label="Create account" fullWidth loading={submitting} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8}>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
  subtitle: { ...typography.small, color: colors.textMuted },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  link: { ...typography.small, color: colors.primary, fontWeight: '600' },
  muted: { ...typography.small, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
