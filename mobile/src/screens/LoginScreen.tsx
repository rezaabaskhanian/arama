/**
 * Login — mirrors the web `(auth)/login` page: butterfly gradient mark, a glass
 * card with phone + password, a gradient submit, and a switch to register.
 * On success AuthContext flips the app into the tabbed shell.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Gradient } from '../components/Gradient';
import { PressableScale } from '../components/ui';
import { ButterflyIcon, LockIcon, PhoneIcon } from '../icons';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return setError('شماره موبایل را وارد کنید');
    if (!password) return setError('رمز عبور را وارد کنید');
    setError('');
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (e: any) {
      setError(e?.message || 'خطایی در هنگام ورود رخ داد');
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
          <Text style={styles.title}>خوش آمدی ✨</Text>
          <Text style={styles.subtitle}>وارد حساب کاربری خود شو</Text>
        </View>

        <View style={styles.card}>
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
                <Text style={styles.submitText}>ورود به حساب</Text>
              )}
            </Gradient>
          </PressableScale>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>هنوز حساب نداری؟</Text>
            <PressableScale onPress={onSwitch} scaleTo={0.95}>
              <Text style={styles.switchLink}>ثبت‌نام رایگان</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad';
}> = ({ icon, label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) => (
  <View style={styles.field}>
    <View style={styles.labelRow}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={styles.input}
      autoCapitalize="none"
    />
  </View>
);

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
  title: { fontSize: 28,  color: colors.text, ...rtlText },
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
  field: { gap: spacing.sm },
  labelRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  label: { fontSize: 13,  color: colors.textBody, ...rtlText },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    
    ...rtlText,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
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
