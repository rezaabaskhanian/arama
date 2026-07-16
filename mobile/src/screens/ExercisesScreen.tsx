/**
 * Exercises tab — mirrors the web `/exercises` page: a search box, category
 * chips, the "chained unlock" note, and a list of practices with locked /
 * completed states. Data comes from the API for the user's trauma level; a
 * progress footer summarises completion. Tapping an open row opens its detail.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, IconTile, PressableScale } from '../components/ui';
import { ChevronLeftIcon, ClockIcon, HeartIcon, LockIcon, SearchIcon, SparklesIcon, TargetIcon, WindIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import {
  ExerciseItem,
  getExercisesByTraumaType,
  getLatestAssessment,
  getUserProgress,
  UserProgress,
} from '../lib/api';
import { getItem, setItem, StorageKeys } from '../lib/storage';

const TRAUMA_LABELS: Record<string, string> = {
  mild: 'ترومای خفیف',
  moderate: 'ترومای متوسط',
  severe: 'ترومای شدید',
  complex: 'ترومای پیچیده',
};

const CATEGORIES = [
  { key: 'all', label: 'همه', kw: [] as string[] },
  { key: 'trauma', label: 'تروما', kw: ['تروما', 'لنگر', 'جعبه', 'ایمن', 'فلاش'] },
  { key: 'calm', label: 'آرامش', kw: ['آرام', 'تنفس', 'یوگا', 'ریلکس', 'مدیتیشن'] },
  { key: 'anxiety', label: 'اضطراب', kw: ['اضطراب', 'استرس', '۵-۴-۳', 'ترس'] },
  { key: 'focus', label: 'تمرکز', kw: ['تمرکز', 'اسکن', 'ذهن', 'حضور'] },
];

const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const ExercisesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [progress, setProgress] = useState<UserProgress>({ completed_exercises: 0, total_exercises: 0 });
  const [trauma, setTrauma] = useState('mild');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  useEffect(() => {
    (async () => {
      const latest = await getLatestAssessment();
      const t = latest?.trauma_type || (await getItem(StorageKeys.traumaType)) || 'mild';
      if (t) await setItem(StorageKeys.traumaType, t);
      setTrauma(t);
      const [ex, prog] = await Promise.all([
        getExercisesByTraumaType(t).catch(() => [] as ExerciseItem[]),
        getUserProgress(t),
      ]);
      setItems(ex || []);
      setProgress(prog);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const c = CATEGORIES.find(x => x.key === cat);
    return items.filter(e => {
      const info = e.exercise_info || e;
      const hay = `${info.title || ''} ${info.description || ''}`;
      const matchQ = !query.trim() || hay.includes(query.trim());
      const matchC = cat === 'all' || (c ? c.kw.some(k => hay.includes(k)) : true);
      return matchQ && matchC;
    });
  }, [items, query, cat]);

  const pct = progress.total_exercises
    ? Math.round((progress.completed_exercises / progress.total_exercises) * 100)
    : 0;

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Text style={styles.h1}>تمرین‌های تو</Text>
      <Text style={styles.p}>هر روز یک قدم کوچک، به سمت آرامش.</Text>

      {/* Commitments banner */}
      <PressableScale onPress={() => push('commitments')} scaleTo={0.97}>
        <View style={styles.commitBanner}>
          <TargetIcon size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.commitBannerTitle}>تمرین‌های واقعی زندگی</Text>
            <Text style={styles.commitBannerSub}>قدم‌های کوچک، تغییرهای بزرگ</Text>
          </View>
          <ChevronLeftIcon size={18} color={colors.textFaint} />
        </View>
      </PressableScale>

      {/* Search */}
      <View style={styles.search}>
        <SearchIcon size={20} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="جست‌وجوی تمرین یا تکنیک..."
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
        />
      </View>

      {/* Categories */}
      <View style={styles.cats}>
        {CATEGORIES.map(c => {
          const active = cat === c.key;
          return (
            <PressableScale key={c.key} onPress={() => setCat(c.key)} scaleTo={0.94}>
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <IconTile colors={gradients.violet}>
            <SparklesIcon size={24} color={colors.white} />
          </IconTile>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>پیشرفت تو</Text>
            <Text style={styles.progressSub}>
              {toFa(progress.completed_exercises)} از {toFa(progress.total_exercises)} تمرین انجام شد
            </Text>
          </View>
          <Text style={styles.pct}>٪{toFa(pct)}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </Card>

      {/* Chained-unlock note */}
      <View style={styles.note}>
        <SparklesIcon size={20} color={colors.primary} />
        <Text style={styles.noteText}>
          تمرین‌ها زنجیره‌ای باز می‌شوند: با «اتمام تمرین»، تمرین بعدی آزاد می‌شود.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      ) : filtered.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {query || cat !== 'all'
              ? 'تمرینی با این فیلتر پیدا نشد.'
              : 'هنوز تمرینی باز نشده — ابتدا ارزیابی وضعیت را انجام بده.'}
          </Text>
          {!query && cat === 'all' ? (
            <PressableScale onPress={() => push('assessment')} scaleTo={0.97}>
              <View style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>شروع ارزیابی</Text>
              </View>
            </PressableScale>
          ) : null}
        </Card>
      ) : (
        filtered.map((item, i) => {
          const info = item.exercise_info || item;
          const locked = !!info.is_locked;
          const completed = !!info.is_completed;
          return (
            <PressableScale
              key={info.id || i}
              onPress={() => (locked ? undefined : push('exercise', { id: info.id }))}
              scaleTo={locked ? 1 : 0.98}>
              <Card style={[styles.row, locked && styles.rowLocked]}>
                {locked ? (
                  <LockIcon size={20} color={colors.textFaint} />
                ) : (
                  <ChevronLeftIcon size={20} color={colors.textFaint} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={[styles.rowTitle, locked && styles.rowTitleLocked]} numberOfLines={1}>
                      {info.title}
                    </Text>
                    {completed ? (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>انجام شد</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.rowMetaRow}>
                    <ClockIcon size={13} color={colors.textFaint} />
                    <Text style={styles.rowMeta}>
                      {toFa(info.duration ?? 0)} دقیقه
                      {locked ? ' · فردا باز می‌شود' : ''}
                    </Text>
                  </View>
                </View>
                <IconTile
                  colors={completed ? gradients.teal : locked ? (['#cbd5e1', '#94a3b8'] as const) : gradients.violet}
                  size={46}>
                  {completed ? (
                    <HeartIcon size={20} color={colors.white} />
                  ) : (
                    <WindIcon size={22} color={colors.white} />
                  )}
                </IconTile>
              </Card>
            </PressableScale>
          );
        })
      )}

      <Text style={styles.footer}>
        سطح فعلی تو: {TRAUMA_LABELS[trauma] || 'نامشخص'}
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 26,  color: colors.text, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted,  marginTop: 4, marginBottom: spacing.lg, ...rtlText },
  search: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...shadow.card,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 14.5, color: colors.text,  ...rtlText },
  cats: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.lg },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  chipText: { fontFamily: font.family, fontSize: 13, color: colors.textMuted },
  chipTextActive: { color: colors.white,  },
  progressCard: { gap: spacing.md },
  progressRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  progressTitle: { fontSize: 15,  color: colors.text, ...rtlText },
  progressSub: { fontSize: 12.5, color: colors.textMuted,  marginTop: 2, ...rtlText },
  pct: { fontFamily: font.family, fontSize: 18, color: colors.primary },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  note: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  noteText: { flex: 1, fontSize: 13, color: colors.textMuted,  lineHeight: 22, ...rtlText },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.lg },
  emptyText: { fontFamily: font.family, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 24, writingDirection: 'rtl' },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
  emptyBtnText: { color: colors.white, fontSize: 14,  ...rtlText },
  commitBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  commitBannerTitle: { fontSize: 14, color: colors.text, ...rtlText },
  commitBannerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2, ...rtlText },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  rowLocked: { opacity: 0.7 },
  rowTitleWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  rowTitle: { fontSize: 15.5,  color: colors.text, ...rtlText, flexShrink: 1 },
  rowTitleLocked: { color: colors.textMuted },
  doneBadge: { backgroundColor: colors.calmSoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  doneBadgeText: { fontFamily: font.family, fontSize: 9, color: colors.calmDark },
  rowMetaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 4 },
  rowMeta: { fontSize: 12.5, color: colors.textMuted,  ...rtlText },
  footer: { fontFamily: font.family, textAlign: 'center', fontSize: 12.5, color: colors.textMuted, marginTop: spacing.lg, writingDirection: 'rtl' },
});
