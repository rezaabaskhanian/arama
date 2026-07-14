/**
 * Settings — mirrors the web `/profile` settings page: editable name, the
 * assessed trauma level (read-only), a kind-notifications toggle, a data-privacy
 * note, a recovery report, and a reset. Name + prefs persist via storage; the
 * report is fed by the API. Pushed as a page (RTL back button).
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header, Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { CheckIcon, RefreshIcon, SettingsIcon, ShieldIcon, SparklesIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getUserProfile } from '../lib/api';
import { getItem, StorageKeys } from '../lib/storage';

const TRAUMA_LABELS: Record<string, string> = {
  mild: 'خفیف',
  moderate: 'متوسط',
  severe: 'شدید',
  complex: 'پیچیده',
};

const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const Toggle: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => {
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: on ? 1 : 0, useNativeDriver: false, speed: 16, bounciness: 6 }).start();
  }, [on, anim]);
  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 28] });
  return (
    <PressableScale onPress={onToggle} scaleTo={0.94}>
      <View style={[styles.toggle, { backgroundColor: on ? colors.primaryDeep : '#e2e8f0' }]}>
        <Animated.View style={[styles.knob, { left }]} />
      </View>
    </PressableScale>
  );
};

export const SettingsScreen: React.FC = () => {
  const { pop } = useNavigation();
  const { user, setUserName, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [trauma, setTrauma] = useState('moderate');
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    (async () => {
      const t = (await getItem(StorageKeys.traumaType)) || 'moderate';
      setTrauma(t);
      const [prof, dash] = await Promise.all([getUserProfile(), getDashboardStats(t)]);
      if (prof?.user?.nickname) setName(prof.user.nickname);
      setCompleted(dash.completed_exercises || 0);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (name.trim()) await setUserName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <View style={styles.fill}>
      <Header title="تنظیمات" onBack={pop} />
      <Screen contentStyle={{ paddingTop: 0 }}>
        {/* Header card */}
        <Card style={styles.headCard}>
          <Gradient colors={gradients.pink} style={styles.headIcon}>
            <SettingsIcon size={26} color={colors.white} />
          </Gradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.headTitle}>تنظیمات حساب و حریم خصوصی</Text>
            <Text style={styles.headSub}>پروفایل کاربری و اعلان‌ها</Text>
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : (
          <>
            {/* Name */}
            <Text style={styles.label}>نام تو</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="نام تو"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />

            {/* Trauma level */}
            <Text style={styles.label}>سطح ارزیابی‌شده تروما</Text>
            <View style={styles.readonly}>
              <Text style={styles.readonlyText}>
                {TRAUMA_LABELS[trauma] || 'نامشخص'} (تغییر از بخش پایش)
              </Text>
            </View>

            {/* Notifications */}
            <Card style={styles.toggleRow}>
              <Toggle on={notify} onToggle={() => setNotify(v => !v)} />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>اعلان‌های مهربان آرامینا</Text>
                <Text style={styles.toggleSub}>یادآورهای خودمراقبتی و تنفس در طول روز</Text>
              </View>
            </Card>

            {/* Data privacy */}
            <Card style={styles.privacy}>
              <View style={styles.privacyHead}>
                <ShieldIcon size={20} color={colors.calm} />
                <Text style={styles.privacyTitle}>حفاظت امنیتی داده‌ها</Text>
              </View>
              <Text style={styles.privacyText}>
                یادداشت‌ها و پاسخ‌های ارزیابی تو به‌صورت رمزنگاری‌شده ذخیره می‌شوند و برای حفظ حریم خصوصی‌ات جایی ارسال نمی‌شوند.
              </Text>
            </Card>

            {/* Save */}
            <PressableScale onPress={handleSave} scaleTo={0.98}>
              <View style={[styles.saveBtn, saved && { backgroundColor: colors.calm }]}>
                {saved ? (
                  <CheckIcon size={20} color={colors.white} />
                ) : (
                  <CheckIcon size={20} color={colors.white} />
                )}
                <Text style={styles.saveText}>{saved ? 'ذخیره شد' : 'ذخیره تغییرات'}</Text>
              </View>
            </PressableScale>

            {/* Recovery report */}
            <Gradient colors={gradients.brand} style={styles.report}>
              <View style={styles.reportHead}>
                <SparklesIcon size={20} color={colors.warmSoft} />
                <Text style={styles.reportTitle}>کارنامه بهبودی تو</Text>
              </View>
              <View style={styles.reportRow}>
                <Text style={styles.reportValue}>{toFa(completed)} تمرین</Text>
                <Text style={styles.reportLabel}>تمرین‌های موفق</Text>
              </View>
              <View style={[styles.reportRow, styles.reportRowLast]}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>{TRAUMA_LABELS[trauma] || 'نامشخص'}</Text>
                </View>
                <Text style={styles.reportLabel}>پرونده فعال تروما</Text>
              </View>
            </Gradient>

            {/* Logout */}
            <PressableScale onPress={logout} scaleTo={0.98}>
              <View style={styles.logout}>
                <RefreshIcon size={18} color={colors.danger} />
                <Text style={styles.logoutText}>خروج از حساب</Text>
              </View>
            </PressableScale>
          </>
        )}
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  headCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  headIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headTitle: { fontSize: 16,  color: colors.text, ...rtlText },
  headSub: { fontSize: 12.5, color: colors.textMuted,  marginTop: 3, ...rtlText },
  label: { fontSize: 13,  color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, ...rtlText },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    
    ...rtlText,
  },
  readonly: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  readonlyText: { fontSize: 14, color: colors.textMuted,  ...rtlText },
  toggleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  toggle: { width: 52, height: 30, borderRadius: radius.pill, justifyContent: 'center' },
  knob: { position: 'absolute', width: 22, height: 22, borderRadius: radius.pill, backgroundColor: colors.white, ...shadow.card },
  toggleTitle: { fontSize: 14.5,  color: colors.text, ...rtlText },
  toggleSub: { fontSize: 12, color: colors.textMuted,  marginTop: 3, ...rtlText },
  privacy: { marginTop: spacing.md, gap: spacing.sm },
  privacyHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  privacyTitle: { fontSize: 14.5,  color: colors.text, ...rtlText },
  privacyText: { fontSize: 13, color: colors.textMuted,  lineHeight: 22, ...rtlText },
  saveBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  saveText: { color: colors.white, fontSize: 15.5,  ...rtlText },
  report: { borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.xl, overflow: 'hidden', ...shadow.floating },
  reportHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  reportTitle: { fontSize: 16,  color: colors.white, ...rtlText },
  reportRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  reportRowLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
  reportLabel: { fontSize: 13.5, color: 'rgba(255,255,255,0.85)',  ...rtlText },
  reportValue: { fontFamily: font.family, fontSize: 14, color: colors.white },
  reportBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 4 },
  reportBadgeText: { fontFamily: font.family, fontSize: 12, color: colors.white },
  logout: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.lg,
  },
  logoutText: { color: colors.danger, fontSize: 15,  ...rtlText },
});
