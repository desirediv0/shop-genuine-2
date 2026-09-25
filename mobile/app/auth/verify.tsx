import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, spacing, typography } from '../../src/theme';

const RESEND_COOLDOWN = 30;

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // The backend rate-limits OTP sends, so gate the resend behind a countdown.
  useEffect(() => {
    timer.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const onVerify = async () => {
    if (otp.trim().length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Verifying also signs the user in.
      await verifyOtp(email ?? '', otp);
      toast('Email verified. You are signed in.', 'success');
      router.replace('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp(email ?? '');
      toast('New code sent', 'success');
      setCooldown(RESEND_COOLDOWN);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={styles.strong}>{email}</Text>. It expires in 10
          minutes.
        </Text>

        <View style={styles.form}>
          <Input
            label="Verification code"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, ''))}
            error={error}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            placeholder="000000"
            style={styles.otpInput}
          />

          <Button label="Verify and continue" fullWidth loading={submitting} onPress={onVerify} />

          <View style={styles.resendRow}>
            {cooldown > 0 ? (
              <Text style={styles.muted}>Resend code in {cooldown}s</Text>
            ) : (
              <Pressable onPress={onResend} hitSlop={8}>
                <Text style={styles.link}>Resend code</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
  subtitle: { ...typography.small, color: colors.textMuted, lineHeight: 20 },
  strong: { color: colors.text, fontWeight: '600' },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  otpInput: { fontSize: 22, letterSpacing: 8, fontWeight: '600' },
  resendRow: { alignItems: 'center' },
  link: { ...typography.small, color: colors.primary, fontWeight: '600' },
  muted: { ...typography.small, color: colors.textMuted },
});
