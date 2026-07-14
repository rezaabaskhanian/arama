/**
 * Exercise detail — pushed from Home/Exercises. Loads the exercise by id, shows
 * its guidance, and lets the user mark it complete (which unlocks the next one
 * server-side). Mirrors the web `/exercises/[id]` flow.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header, Screen } from '../components/Screen';
import { GradientButton } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { CheckIcon, ClockIcon, WindIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import { completeExercise, ExerciseInfo, getExerciseById } from '../lib/api';
import { getItem, StorageKeys } from '../lib/storage';

const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const ExerciseDetailScreen: React.FC<{ params?: Record<string, unknown> }> = ({ params }) => {
  const { pop } = useNavigation();
  const id = (params?.id as string) || '';
  const [info, setInfo] = useState<ExerciseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getExerciseById(id);
        setInfo((res.exercise_info || res) as ExerciseInfo);
      } catch {
        setInfo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleComplete = async () => {
    if (completing || !info) return;
    setCompleting(true);
    try {
      const trauma = info.trauma_type || (await getItem(StorageKeys.traumaType)) || 'mild';
      await completeExercise(id, trauma);
      setDone(true);
      setTimeout(pop, 900);
    } catch {
      // ignore; user can retry
    } finally {
      setCompleting(false);
    }
  };

  return (
    <View style={styles.fill}>
      <Header title={info?.title || 'تمرین'} onBack={pop} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !info ? (
        <View style={styles.center}>
          <Text style={styles.error}>تمرین یافت نشد.</Text>
        </View>
      ) : (
        <Screen contentStyle={{ paddingTop: 0 }}>
          <Gradient colors={gradients.violet} angle={130} style={styles.hero}>
            <View style={styles.heroIcon}>
              <WindIcon size={30} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>{info.title}</Text>
            <View style={styles.heroMeta}>
              <ClockIcon size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroMetaText}>{toFa(info.duration ?? 0)} دقیقه</Text>
            </View>
          </Gradient>

          {/* Meta chips */}
          <View style={styles.chips}>
            {info.trauma_type ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>سطح: {info.trauma_type}</Text>
              </View>
            ) : null}
            <View style={[styles.chip, info.is_completed && styles.chipDone]}>
              <Text style={[styles.chipText, info.is_completed && styles.chipDoneText]}>
                {info.is_completed ? 'انجام شده ✓' : 'آماده‌ی تمرین'}
              </Text>
            </View>
          </View>

          <Text style={styles.body}>
            {info.content ||
              info.description ||
              'یک جای آرام پیدا کن، چند نفس عمیق بکش و با تمرکز کامل این تمرین را انجام بده. عجله نکن؛ اجازه بده بدن و ذهنت آرام شوند. وقتی آماده شدی، «اتمام تمرین» را بزن تا تمرین بعدی برایت باز شود.'}
          </Text>

          <View style={styles.tips}>
            <Text style={styles.tip}>• با آرامش و بدون قضاوت شروع کن</Text>
            <Text style={styles.tip}>• اگر خسته شدی، مکث کن</Text>
            <Text style={styles.tip}>• هر قدم کوچک، ارزشمند است</Text>
          </View>

          {done ? (
            <View style={styles.doneBtn}>
              <CheckIcon size={20} color={colors.white} />
              <Text style={styles.doneText}>ثبت شد 🌿</Text>
            </View>
          ) : (
            <GradientButton
              label={completing ? 'در حال ثبت...' : info.is_completed ? 'ثبت دوباره' : 'اتمام تمرین'}
              colors={gradients.violet}
              onPress={handleComplete}
              style={{ marginTop: spacing.xl }}
            />
          )}
        </Screen>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 15, color: colors.textMuted,  ...rtlText },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
    ...shadow.floating,
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontFamily: font.family, fontSize: 21, color: colors.white, textAlign: 'center', ...{ writingDirection: 'rtl' as const } },
  heroMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  heroMetaText: { fontFamily: font.family, color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  chips: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.lg },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { fontFamily: font.family, fontSize: 12, color: colors.textMuted },
  chipDone: { backgroundColor: colors.calmSoft, borderColor: colors.calmSoft },
  chipDoneText: { color: colors.calmDark },
  body: {
    fontSize: 15.5,
    lineHeight: 30,
    color: colors.textMuted,
    
    marginTop: spacing.lg,
    ...rtlText,
  },
  tips: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tip: { fontSize: 14, color: colors.text,  lineHeight: 26, ...rtlText },
  doneBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.calm,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.xl,
    ...shadow.soft,
  },
  doneText: { color: colors.white, fontSize: 16,  ...rtlText },
});
