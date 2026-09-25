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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(email, password);
      toast('Welcome back', 'success');
      router.replace('/');
    } catch (e) {
      const message = (e as Error).message;
      // The backend blocks unverified accounts — route them to the OTP screen.
      if (message.toLowerCase().includes('verify')) {
        toast('Please verify your email first', 'info');
        router.push({ pathname: '/auth/verify', params: { email: email.trim() } });
      } else {
        toast(message, 'error');
      }
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your Shop Genuine account.</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secure
            autoCapitalize="none"
            textContentType="password"
            placeholder="Your password"
          />

          <Pressable
            onPress={() => router.push('/auth/forgot')}
            hitSlop={8}
            style={styles.forgotWrap}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <Button label="Sign in" fullWidth loading={submitting} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.muted}>New to Shop Genuine? </Text>
          <Pressable onPress={() => router.replace('/auth/register')} hitSlop={8}>
            <Text style={styles.link}>Create an account</Text>
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
  forgotWrap: { alignSelf: 'flex-end' },
  link: { ...typography.small, color: colors.primary, fontWeight: '600' },
  muted: { ...typography.small, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
