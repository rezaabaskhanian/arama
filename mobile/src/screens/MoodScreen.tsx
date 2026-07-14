/**
 * Mood tab — mirrors the web `/mood` page: five heart options (very-bad → great)
 * with soft colour states, a save button, and a recent-trend strip. Reads and
 * writes today's mood through the API (getTodayMood / saveTodayMood).
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { ActivityIcon, CheckIcon, HeartIcon } from '../icons';
import { getMoodTrend, getTodayMood, saveTodayMood } from '../lib/api';

type MoodOption = { value: number; label: string; color: string; bg: string };

// Matches the web /mood page (1..5).
const MOODS: MoodOption[] = [
  { value: 1, label: 'خیلی بد', color: '#ef4444', bg: '#fef2f2' },
  { value: 2, label: 'بد', color: '#f97316', bg: '#fff7ed' },
  { value: 3, label: 'معمولی', color: '#eab308', bg: '#fefce8' },
  { value: 4, label: 'خوب', color: '#10b981', bg: '#ecfdf5' },
  { value: 5, label: 'عالی', color: '#14b8a6', bg: '#f0fdfa' },
];

const WEEK_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const MoodScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const [today, t] = await Promise.all([getTodayMood(), getMoodTrend(7)]);
      if (today && typeof today.mood === 'number') setSelected(today.mood);
      setTrend(t.moods || []);
      setStreak(t.streak || 0);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (selected == null || saving) return;
    setSaving(true);
    try {
      await saveTodayMood(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const t = await getMoodTrend(7);
      setTrend(t.moods || []);
      setStreak(t.streak || 0);
    } catch {
      // keep silent; the button simply won't flip to "saved"
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Gradient colors={gradients.violet} style={styles.headerIcon}>
          <ActivityIcon size={22} color={colors.white} />
        </Gradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>پایش احساسات</Text>
          <Text style={styles.p}>توجه به احساسات، اولین قدم بهبودی است</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>همین الان چه حسی داری؟</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : (
          <View style={styles.moodRow}>
            {MOODS.map(m => {
              const active = selected === m.value;
              return (
                <PressableScale key={m.value} onPress={() => setSelected(m.value)} scaleTo={0.9}>
                  <View style={styles.moodItem}>
                    <View
                      style={[
                        styles.moodBubble,
                        active && { backgroundColor: m.bg, borderColor: m.color },
                      ]}>
                      <HeartIcon size={26} color={active ? m.color : colors.textFaint} />
                    </View>
                    <Text
                      style={[styles.moodLabel, active && { color: m.color,  }]}>
                      {m.label}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}

        <PressableScale
          onPress={handleSave}
          scaleTo={0.98}
          style={{ marginTop: spacing.xl }}>
          <View
            style={[
              styles.saveBtn,
              saved ? styles.saveBtnDone : selected == null ? styles.saveBtnOff : styles.saveBtnOn,
            ]}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                {saved ? (
                  <CheckIcon size={20} color={colors.white} />
                ) : (
                  <ActivityIcon size={20} color={selected == null ? colors.textFaint : colors.white} />
                )}
                <Text
                  style={[
                    styles.saveText,
                    { color: selected == null && !saved ? colors.textFaint : colors.white },
                  ]}>
                  {saved ? 'ثبت شد!' : 'ثبت احساس امروز'}
                </Text>
              </>
            )}
          </View>
        </PressableScale>
      </Card>

      <View style={styles.trendHeader}>
        <Text style={styles.section}>روند اخیر</Text>
        {streak > 0 ? (
          <Text style={styles.streak}>🔥 {streak} روز پیاپی</Text>
        ) : null}
      </View>
      <Card>
        <View style={styles.week}>
          {WEEK_LABELS.map((label, i) => {
            const v = trend[i];
            const opt = MOODS.find(m => m.value === v);
            return (
              <View key={i} style={styles.day}>
                <View
                  style={[
                    styles.dayBubble,
                    opt ? { backgroundColor: opt.bg } : styles.dayEmpty,
                  ]}>
                  {opt ? (
                    <HeartIcon size={16} color={opt.color} />
                  ) : (
                    <Text style={styles.dayDot}>·</Text>
                  )}
                </View>
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  h1: { fontSize: 24,  color: colors.text, ...rtlText },
  p: { fontSize: 13, color: colors.textMuted,  marginTop: 4, ...rtlText },
  card: { alignItems: 'stretch' },
  cardTitle: {
    fontFamily: font.family,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    ...{ writingDirection: 'rtl' as const },
  },
  moodRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', gap: spacing.sm, width: 58 },
  moodBubble: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: { fontFamily: font.family, fontSize: 11.5, color: colors.textMuted },
  saveBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  saveBtnOn: { backgroundColor: colors.primaryDeep, ...shadow.soft },
  saveBtnOff: { backgroundColor: colors.surfaceMuted },
  saveBtnDone: { backgroundColor: colors.calm, ...shadow.soft },
  saveText: { fontSize: 16,  ...rtlText },
  trendHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  section: { fontSize: 16,  color: colors.text, ...rtlText },
  streak: { fontFamily: font.family, fontSize: 12.5, color: colors.accent },
  week: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: spacing.sm },
  dayBubble: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmpty: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  dayDot: { fontFamily: font.family, fontSize: 18, color: colors.textFaint },
  dayLabel: { fontFamily: font.family, fontSize: 12, color: colors.textMuted },
});
