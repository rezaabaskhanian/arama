/**
 * Register — same visual language as Login. Collects nickname, phone and
 * password, registers via the API, then auto signs-in (AuthContext.register).
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Gradient } from '../components/Gradient';
import { PressableScale } from '../components/ui';
import { ButterflyIcon, LockIcon, PhoneIcon, UserIcon } from '../icons';
import { useAuth } from '../context/AuthContext';
import { Field } from './LoginScreen';

export const RegisterScreen: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!nickname.trim()) return setError('نام خود را وارد کنید');
    if (!phone.trim()) return setError('شماره موبایل را وارد کنید');
    if (password.length < 6) return setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
    setError('');
    setLoading(true);
    try {
      await register({ nickname: nickname.trim(), phone: phone.trim(), password });
    } catch (e: any) {
      setError(e?.message || 'خطایی در ثبت‌نام رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <Gradient colors={['#8b5cf6', '#ec4899']} angle={135} style={styles.logo}>
            <ButterflyIcon size={40} color={colors.white} />
          </Gradient>
          <Text style={styles.title}>به آرامینا بپیوند 🌿</Text>
          <Text style={styles.subtitle}>یک حساب کاربری امن بساز</Text>
        </View>

        <View style={styles.card}>
          <Field
            icon={<UserIcon size={18} color={colors.primary} />}
            label="نام"
            value={nickname}
            onChangeText={setNickname}
            placeholder="نام تو"
          />
          <Field
            icon={<PhoneIcon size={18} color={colors.primary} />}
            label="شماره موبایل"
            value={phone}
            onChangeText={setPhone}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            keyboardType="phone-pad"
          />
          <Field
            icon={<LockIcon size={18} color={colors.primary} />}
            label="رمز عبور"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error ? (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PressableScale onPress={loading ? undefined : submit} scaleTo={0.98} style={{ marginTop: spacing.sm }}>
            <Gradient colors={gradients.violet} style={styles.submit}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>ساخت حساب و ورود</Text>
              )}
            </Gradient>
          </PressableScale>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>حساب داری؟</Text>
            <PressableScale onPress={onSwitch} scaleTo={0.95}>
              <Text style={styles.switchLink}>ورود</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.floating,
  },
  title: { fontSize: 26,  color: colors.text, ...rtlText },
  subtitle: { fontSize: 14, color: colors.textMuted,  marginTop: 6, ...rtlText },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
    gap: spacing.lg,
  },
  error: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md },
  errorText: { color: colors.danger, fontSize: 13,  ...rtlText },
  submit: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  submitText: { color: colors.white, fontSize: 16,  ...rtlText },
  switchRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  switchText: { fontFamily: font.family, color: colors.textMuted, fontSize: 13 },
  switchLink: { fontFamily: font.family, color: colors.primary, fontSize: 13 },
});
