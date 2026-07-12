/**
 * Profile tab — avatar header on a gradient, a couple of stats, and a settings
 * list. Each row pushes a detail page so the RTL back button is demonstrable.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  BellIcon,
  ChevronRightIcon,
  CompassIcon,
  ShieldIcon,
  UserIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

const rows = [
  { key: 'notifications', label: 'یادآوری‌های مهربان', icon: 'bell' as const },
  { key: 'supervision', label: 'ارتباط با متخصص', icon: 'shield' as const },
  { key: 'guide', label: 'راهنمای اپلیکیشن', icon: 'compass' as const },
];

const rowIcon = (key: string) => {
  const p = { size: 22, color: colors.primary };
  if (key === 'bell') return <BellIcon {...p} />;
  if (key === 'shield') return <ShieldIcon {...p} />;
  return <CompassIcon {...p} />;
};

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Gradient colors={gradients.violet} angle={130} style={styles.hero}>
        <View style={styles.avatar}>
          <UserIcon size={34} color={colors.white} />
        </View>
        <Text style={styles.name}>همراه عزیز</Text>
        <Text style={styles.since}>۲۴ روز در مسیر آرامش 🌿</Text>

        <View style={styles.stats}>
          <Stat value="۱۲" label="تمرین" />
          <View style={styles.divider} />
          <Stat value="۸" label="نوشته" />
          <View style={styles.divider} />
          <Stat value="۶" label="روز پیاپی" />
        </View>
      </Gradient>

      <View style={{ height: spacing.lg }} />

      {rows.map(r => (
        <PressableScale key={r.key} onPress={() => push('detail', { key: r.key })}>
          <Card style={styles.row}>
            <ChevronRightIcon size={20} color={colors.textFaint} />
            <Text style={styles.rowLabel}>{r.label}</Text>
            <View style={styles.rowIcon}>{rowIcon(r.icon)}</View>
          </Card>
        </PressableScale>
      ))}

      <PressableScale onPress={() => push('detail', { key: 'logout' })}>
        <Card style={[styles.row, styles.logout]}>
          <Text style={styles.logoutText}>خروج از حساب</Text>
        </Card>
      </PressableScale>
    </Screen>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadow.floating,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { fontSize: 20, fontWeight: font.black, color: colors.white, ...rtlText },
  since: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: font.medium, marginTop: 4 },
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
  statValue: { fontSize: 20, fontWeight: font.black, color: colors.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: font.medium, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15.5, fontWeight: font.bold, color: colors.text, ...rtlText },
  logout: { justifyContent: 'center' },
  logoutText: { fontSize: 15, fontWeight: font.black, color: colors.danger, ...rtlText },
});
