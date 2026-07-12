/**
 * Floating bottom tab bar with a raised, gradient center "home" button.
 * Non-center tabs animate icon color + a soft rising dot when active; the
 * center button springs on press. Sits above content with a translucent card.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../theme';
import { gradients } from '../theme';
import { Gradient } from '../components/Gradient';
import { PressableScale } from '../components/ui';
import {
  ActivityIcon,
  BookIcon,
  HomeIcon,
  IconProps,
  SparklesIcon,
  UserIcon,
} from '../icons';
import { TabKey, useNavigation } from './NavigationContext';

type TabDef = {
  key: TabKey;
  label: string;
  Icon: React.FC<IconProps>;
  center?: boolean;
};

// Visual order (right-to-left reader still perceives HOME in the middle).
const TABS: TabDef[] = [
  { key: 'exercises', label: 'تمرین‌ها', Icon: SparklesIcon },
  { key: 'journal', label: 'ژورنال', Icon: BookIcon },
  { key: 'home', label: 'خانه', Icon: HomeIcon, center: true },
  { key: 'mood', label: 'حال من', Icon: ActivityIcon },
  { key: 'profile', label: 'پروفایل', Icon: UserIcon },
];

export const TabBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { tab, switchTab } = useNavigation();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map(t =>
          t.center ? (
            <CenterTab key={t.key} def={t} active={tab === t.key} onPress={() => switchTab(t.key)} />
          ) : (
            <SideTab key={t.key} def={t} active={tab === t.key} onPress={() => switchTab(t.key)} />
          ),
        )}
      </View>
    </View>
  );
};

const SideTab: React.FC<{ def: TabDef; active: boolean; onPress: () => void }> = ({
  def,
  active,
  onPress,
}) => {
  const v = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: active ? 1 : 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  }, [active, v]);

  const { Icon, label } = def;
  return (
    <PressableScale onPress={onPress} style={styles.side} scaleTo={0.85}>
      <View style={styles.sideInner}>
        <Icon size={24} color={active ? colors.primary : colors.textFaint} strokeWidth={active ? 2.4 : 2} />
        <Text style={[styles.sideLabel, active && styles.sideLabelActive]}>{label}</Text>
        <Animated.View
          style={[
            styles.dot,
            { opacity: v, transform: [{ scale: v }] },
          ]}
        />
      </View>
    </PressableScale>
  );
};

const CenterTab: React.FC<{ def: TabDef; active: boolean; onPress: () => void }> = ({
  def,
  active,
  onPress,
}) => {
  const { Icon, label } = def;
  return (
    <View style={styles.centerSlot}>
      <PressableScale onPress={onPress} scaleTo={0.88}>
        <Gradient
          colors={active ? gradients.violet : (['#A78BFA', '#7C3AED'] as const)}
          angle={135}
          style={styles.centerBtn}>
          <Icon size={28} color={colors.white} strokeWidth={2.4} />
        </Gradient>
      </PressableScale>
      <Text style={[styles.centerLabel, active && styles.sideLabelActive]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    width: '100%',
    ...shadow.floating,
  },
  side: { flex: 1 },
  sideInner: { alignItems: 'center', gap: 4, paddingVertical: 2 },
  sideLabel: { fontSize: 11, color: colors.textFaint, fontWeight: font.semibold },
  sideLabelActive: { color: colors.primary, fontWeight: font.black },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
  centerSlot: { flex: 1, alignItems: 'center' },
  centerBtn: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34, // raise above the bar
    borderWidth: 4,
    borderColor: colors.white,
    overflow: 'hidden',
    ...shadow.floating,
  },
  centerLabel: { fontSize: 11, color: colors.textFaint, fontWeight: font.semibold, marginTop: 4 },
});
