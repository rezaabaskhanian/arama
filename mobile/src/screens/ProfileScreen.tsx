/**
 * Profile — pushed from the avatar in the Home header. Gradient avatar header
 * with real recovery stats, then a list (assessment, settings, guide,
 * supervision) and logout. Stats come from the API; identity from AuthContext.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header, Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  ChevronLeftIcon,
  ClipboardIcon,
  CompassIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../lib/api';
import { getItem, StorageKeys } from '../lib/storage';

const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

type Row = { key: string; label: string; icon: React.FC<{ size?: number; color?: string }>; route: string };

const rows: Row[] = [
  { key: 'assessment', label: 'ارزیابی وضعیت روحی', icon: ClipboardIcon, route: 'assessment' },
  { key: 'settings', label: 'تنظیمات و حریم خصوصی', icon: SettingsIcon, route: 'settings' },
  { key: 'guide', label: 'راهنمای اپلیکیشن', icon: CompassIcon, route: 'guide' },
  { key: 'supervision', label: 'ارتباط با متخصص', icon: ShieldIcon, route: 'detail' },
];

export const ProfileScreen: React.FC = () => {
  const { push, pop } = useNavigation();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ completed_exercises: 0, journal_entries: 0, streak: 0 });

  useEffect(() => {
    (async () => {
      const t = (await getItem(StorageKeys.traumaType)) || 'mild';
      const dash = await getDashboardStats(t);
      setStats({
        completed_exercises: dash.completed_exercises || 0,
        journal_entries: dash.journal_entries || 0,
        streak: dash.streak || 0,
      });
    })();
  }, []);

  return (
    <View style={styles.fill}>
      <Header title="پروفایل" onBack={pop} />
      <Screen contentStyle={{ paddingTop: 0 }}>
      <Gradient colors={gradients.violet} angle={130} style={styles.hero}>
        <View style={styles.avatar}>
          <UserIcon size={34} color={colors.white} />
        </View>
        <Text style={styles.name}>{user?.name || 'همراه عزیز'}</Text>
        <Text style={styles.since}>در مسیر آرامش 🌿</Text>

        <View style={styles.stats}>
          <Stat value={toFa(stats.completed_exercises)} label="تمرین" />
          <View style={styles.divider} />
          <Stat value={toFa(stats.journal_entries)} label="نوشته" />
          <View style={styles.divider} />
          <Stat value={toFa(stats.streak)} label="روز پیاپی" />
        </View>
      </Gradient>

      <View style={{ height: spacing.lg }} />

      {rows.map(r => {
        const Icon = r.icon;
        return (
          <PressableScale
            key={r.key}
            onPress={() => (r.route === 'detail' ? push('detail', { key: r.key }) : push(r.route))}>
            <Card style={styles.row}>
              <ChevronLeftIcon size={20} color={colors.textFaint} />
              <Text style={styles.rowLabel}>{r.label}</Text>
              <View style={styles.rowIcon}>
                <Icon size={22} color={colors.primary} />
              </View>
            </Card>
          </PressableScale>
        );
      })}

      <PressableScale onPress={logout}>
        <Card style={[styles.row, styles.logout]}>
          <Text style={styles.logoutText}>خروج از حساب</Text>
        </Card>
      </PressableScale>
      </Screen>
    </View>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: { borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', overflow: 'hidden', ...shadow.floating },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { fontSize: 20,  color: colors.white, ...rtlText },
  since: { fontFamily: font.family, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  stats: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontFamily: font.family, fontSize: 20, color: colors.white },
  statLabel: { fontFamily: font.family, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15.5,  color: colors.text, ...rtlText },
  logout: { justifyContent: 'center' },
  logoutText: { fontSize: 15,  color: colors.danger, ...rtlText },
});
