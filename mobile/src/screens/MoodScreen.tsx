/**
 * Mood tab — pick today's feeling from a soft emoji row (animated selection),
 * then see a simple weekly strip. Local state only; wire to the API later.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, GradientButton, PressableScale } from '../components/ui';

const moods = [
  { key: 'great', emoji: '😊', label: 'عالی', color: '#10B981' },
  { key: 'ok', emoji: '🙂', label: 'خوب', color: '#38BDF8' },
  { key: 'meh', emoji: '😐', label: 'معمولی', color: '#F59E0B' },
  { key: 'low', emoji: '😔', label: 'دلگیر', color: '#A78BFA' },
  { key: 'bad', emoji: '😣', label: 'سخت', color: '#EF4444' },
];

const week = [
  { d: 'ش', e: '🙂' },
  { d: 'ی', e: '😊' },
  { d: 'د', e: '😐' },
  { d: 'س', e: '😔' },
  { d: 'چ', e: '🙂' },
  { d: 'پ', e: '😊' },
  { d: 'ج', e: '' },
];

export const MoodScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Text style={styles.h1}>حال دلت چطوره؟</Text>
      <Text style={styles.p}>حس امروزت را با مهربانی ثبت کن.</Text>

      <Card>
        <View style={styles.moodRow}>
          {moods.map(m => {
            const active = selected === m.key;
            return (
              <PressableScale key={m.key} onPress={() => setSelected(m.key)} scaleTo={0.9}>
                <View style={styles.moodItem}>
                  <View
                    style={[
                      styles.moodBubble,
                      active && { backgroundColor: m.color + '22', borderColor: m.color },
                    ]}>
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  </View>
                  <Text style={[styles.moodLabel, active && { color: m.color, fontWeight: font.black }]}>
                    {m.label}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>

        <GradientButton
          label={selected ? 'ثبت حال امروز' : 'یک حس را انتخاب کن'}
          colors={selected ? gradients.violet : (['#C4B5FD', '#A78BFA'] as const)}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      <Text style={styles.section}>این هفته</Text>
      <Card>
        <View style={styles.week}>
          {week.map((w, i) => (
            <View key={i} style={styles.day}>
              <View style={[styles.dayBubble, !w.e && styles.dayEmpty]}>
                <Text style={styles.dayEmoji}>{w.e || '·'}</Text>
              </View>
              <Text style={styles.dayLabel}>{w.d}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: font.black, color: colors.text, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted, fontWeight: font.medium, marginTop: 4, marginBottom: spacing.lg, ...rtlText },
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
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 12, color: colors.textMuted, fontWeight: font.medium },
  section: {
    fontSize: 16,
    fontWeight: font.black,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...rtlText,
  },
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
  dayEmoji: { fontSize: 18 },
  dayLabel: { fontSize: 12, color: colors.textMuted, fontWeight: font.medium },
});
