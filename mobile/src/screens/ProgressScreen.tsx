/**
 * Progress tab ("روند بهبود") — the mobile take on the web `/progress` page:
 * a reassess reminder, the PCL-5 score with severity, recovery indicators
 * (exercise consistency, journaling, streak) and a 6-month mood-trend chart.
 * All data comes from the backend (mood trend, dashboard stats, latest assessment).
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { BookIcon, ClipboardIcon, FlameIcon, SparklesIcon, WindIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import {
  DashboardStats,
  getDashboardStats,
  getLatestAssessment,
  getMoodTrend,
  LatestAssessment,
} from '../lib/api';
import { getItem, StorageKeys } from '../lib/storage';

const MONTHS = ['۶ ماه', '۵ ماه', '۴ ماه', '۳ ماه', '۲ ماه', 'این ماه'];
const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

function bucketAverages(arr: number[], n: number): number[] {
  if (!arr.length) return Array(n).fill(0);
  const out: number[] = [];
  const size = arr.length / n;
  for (let i = 0; i < n; i++) {
    const slice = arr.slice(Math.floor(i * size), Math.floor((i + 1) * size));
    const valid = slice.filter(v => v > 0);
    out.push(valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0);
  }
  return out;
}

function severity(score: number | null) {
  if (score == null) return { label: 'ثبت نشده', color: colors.textFaint };
  if (score <= 20) return { label: 'خفیف', color: colors.calm };
  if (score <= 32) return { label: 'متوسط', color: colors.warm };
  if (score <= 50) return { label: 'شدید', color: '#f97316' };
  return { label: 'بسیار شدید', color: colors.accent };
}

export const ProgressScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [buckets, setBuckets] = useState<number[]>(Array(6).fill(0));
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latest, setLatest] = useState<LatestAssessment>(null);

  useEffect(() => {
    (async () => {
      const trauma = (await getItem(StorageKeys.traumaType)) || 'mild';
      const [trend, dash, la] = await Promise.all([
        getMoodTrend(180),
        getDashboardStats(trauma),
        getLatestAssessment(),
      ]);
      const chrono = [...(trend.moods || [])].reverse();
      setBuckets(bucketAverages(chrono, 6));
      setStreak(trend.streak || 0);
      setStats(dash);
      setLatest(la);
      setLoading(false);
    })();
  }, []);

  const score = typeof latest?.total_score === 'number' ? latest.total_score : null;
  const sev = severity(score);
  const exercisePct = stats?.total_exercises
    ? Math.round((stats.completed_exercises / stats.total_exercises) * 100)
    : 0;
  const journalPct = Math.min(100, (stats?.journal_entries || 0) * 10);
  const filled = buckets.filter(b => b > 0);
  const needsAssess = !latest || score == null;

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.badge}>
        <SparklesIcon size={14} color={colors.primary} />
        <Text style={styles.badgeText}>مسیر بهبودی تو</Text>
      </View>
      <Text style={styles.h1}>پایش وضعیت</Text>
      <Text style={styles.p}>اثر تمرین‌ها را روی بهبودی‌ات ببین.</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      ) : (
        <>
          {/* Reassess reminder */}
          {needsAssess ? (
            <Gradient colors={gradients.brand} style={styles.reassess}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reassessTitle}>وقتِ ارزیابی است</Text>
                <Text style={styles.reassessDesc}>
                  نمره‌ی پایه‌ات را بگیر تا روند بهبودی‌ات را ببینی.
                </Text>
              </View>
              <PressableScale onPress={() => push('assessment')} scaleTo={0.96}>
                <View style={styles.reassessBtn}>
                  <ClipboardIcon size={16} color={colors.white} />
                  <Text style={styles.reassessBtnText}>ارزیابی</Text>
                </View>
              </PressableScale>
            </Gradient>
          ) : null}

          {/* PCL-5 score */}
          <Card style={styles.scoreCard}>
            <View style={styles.scoreHead}>
              <View style={[styles.sevBadge, { backgroundColor: sev.color + '22' }]}>
                <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
              </View>
              <Text style={styles.scoreTitle}>نمره‌ی ارزیابی (PCL-5)</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreMax}>از ۸۰</Text>
              <Text style={styles.scoreValue}>{score == null ? '—' : toFa(score)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  { width: `${score != null ? (score / 80) * 100 : 0}%`, backgroundColor: sev.color },
                ]}
              />
            </View>
          </Card>

          {/* Indicators */}
          <Text style={styles.section}>شاخص‌های بهبودی</Text>
          <Card style={{ gap: spacing.lg }}>
            <Indicator
              icon={<WindIcon size={16} color={colors.calmDark} />}
              label="استمرار تمرین"
              value={exercisePct}
              hint={`${toFa(stats?.completed_exercises || 0)} از ${toFa(stats?.total_exercises || 0)} تمرین`}
              color={colors.calm}
            />
            <Indicator
              icon={<BookIcon size={16} color={colors.warm} />}
              label="خودمراقبتی"
              value={journalPct}
              hint={`${toFa(stats?.journal_entries || 0)} یادداشت`}
              color={colors.warmSoft}
            />
            <View style={styles.streakRow}>
              <Text style={styles.streakValue}>{toFa(streak)}</Text>
              <View style={styles.streakLabel}>
                <FlameIcon size={16} color={colors.accent} />
                <Text style={styles.streakText}>روزهای پیاپی</Text>
              </View>
            </View>
          </Card>

          {/* Mood trend */}
          <Text style={styles.section}>روندِ حال‌وهوا (۶ ماهه)</Text>
          <Card>
            {filled.length === 0 ? (
              <Text style={styles.empty}>هنوز حالی ثبت نشده است. از تب «حال من» شروع کن.</Text>
            ) : (
              <View style={styles.chart}>
                {buckets.map((m, i) => (
                  <View key={i} style={styles.bar}>
                    <Text style={styles.barValue}>{m > 0 ? toFa(m.toFixed(1)) : '—'}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${m > 0 ? Math.max(6, (m / 5) * 100) : 3}%`,
                            backgroundColor: m > 0 ? colors.primary : colors.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{MONTHS[i]}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
};

const Indicator: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  color: string;
}> = ({ icon, label, value, hint, color }) => (
  <View style={{ gap: 6 }}>
    <View style={styles.indHead}>
      <Text style={styles.indPct}>٪{toFa(Math.round(value))}</Text>
      <View style={styles.indLabelWrap}>
        {icon}
        <Text style={styles.indLabel}>{label}</Text>
      </View>
    </View>
    <View style={styles.indTrack}>
      <View style={[styles.indFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.indHint}>{hint}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: font.family, fontSize: 12, color: colors.primary },
  h1: { fontSize: 26,  color: colors.text, marginTop: spacing.md, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted,  marginTop: 4, marginBottom: spacing.lg, ...rtlText },
  reassess: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.floating,
  },
  reassessTitle: { fontSize: 16,  color: colors.white, ...rtlText },
  reassessDesc: { fontSize: 12.5, color: 'rgba(255,255,255,0.9)',  marginTop: 4, ...rtlText },
  reassessBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  reassessBtnText: { fontFamily: font.family, color: colors.white, fontSize: 13 },
  scoreCard: { gap: spacing.md },
  scoreHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  scoreTitle: { fontSize: 15,  color: colors.text, ...rtlText },
  sevBadge: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  sevText: { fontFamily: font.family, fontSize: 12 },
  scoreRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6 },
  scoreValue: { fontFamily: font.family, fontSize: 44, color: colors.text },
  scoreMax: { fontFamily: font.family, fontSize: 14, color: colors.textFaint },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: radius.pill },
  section: { fontSize: 16,  color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md, ...rtlText },
  indHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  indLabelWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  indLabel: { fontSize: 13.5,  color: colors.textBody, ...rtlText },
  indPct: { fontFamily: font.family, fontSize: 12, color: colors.textMuted },
  indTrack: { height: 9, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  indFill: { height: '100%', borderRadius: radius.pill },
  indHint: { fontSize: 10.5,  color: colors.textFaint, ...rtlText },
  streakRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  streakLabel: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  streakText: { fontSize: 13.5,  color: colors.textBody, ...rtlText },
  streakValue: { fontFamily: font.family, fontSize: 16, color: colors.text },
  empty: { fontFamily: font.family, fontSize: 13.5, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl, lineHeight: 24, writingDirection: 'rtl' },
  chart: { flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'space-between', height: 170, paddingTop: spacing.sm },
  bar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' },
  barValue: { fontFamily: font.family, fontSize: 10, color: colors.textMuted },
  barTrack: { flex: 1, width: '58%', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm, minHeight: 6 },
  barLabel: { fontFamily: font.family, fontSize: 9.5, color: colors.textFaint },
});
