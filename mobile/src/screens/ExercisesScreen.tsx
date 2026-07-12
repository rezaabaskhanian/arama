/**
 * Exercises tab — a scrollable list of guided practices with a soft progress
 * bar. Tapping a row opens its detail page.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, IconTile, PressableScale } from '../components/ui';
import { ChevronRightIcon, SparklesIcon, WindIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

type Item = {
  key: string;
  title: string;
  meta: string;
  done: boolean;
  tint: readonly [string, string];
};

const items: Item[] = [
  { key: 'e1', title: 'تنفس آرام‌بخش ۴-۷-۸', meta: '۵ دقیقه · تنفس', done: true, tint: gradients.sky },
  { key: 'e2', title: 'اسکن بدن و رها کردن تنش', meta: '۸ دقیقه · ذهن‌آگاهی', done: true, tint: gradients.teal },
  { key: 'e3', title: 'زمین‌گیری ۵-۴-۳-۲-۱', meta: '۶ دقیقه · گراندینگ', done: false, tint: gradients.violet },
  { key: 'e4', title: 'نامه‌ی مهربانی به خود', meta: '۱۰ دقیقه · نوشتن', done: false, tint: gradients.pink },
  { key: 'e5', title: 'تصویرسازی مکان امن', meta: '۷ دقیقه · تجسم', done: false, tint: gradients.amber },
];

export const ExercisesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Text style={styles.h1}>تمرین‌های تو</Text>
      <Text style={styles.p}>هر روز یک قدم کوچک، به سمت آرامش.</Text>

      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <IconTile colors={gradients.violet}>
            <SparklesIcon size={24} color={colors.white} />
          </IconTile>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>پیشرفت این هفته</Text>
            <Text style={styles.progressSub}>
              {done} از {items.length} تمرین انجام شد
            </Text>
          </View>
          <Text style={styles.pct}>٪{pct}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </Card>

      <View style={{ height: spacing.lg }} />

      {items.map(item => (
        <PressableScale
          key={item.key}
          onPress={() => push('detail', { key: 'exercises', title: item.title })}>
          <Card style={styles.row}>
            <ChevronRightIcon size={20} color={colors.textFaint} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowMeta}>{item.meta}</Text>
            </View>
            <IconTile colors={item.tint} size={46}>
              <WindIcon size={22} color={colors.white} />
            </IconTile>
          </Card>
        </PressableScale>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: font.black, color: colors.text, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted, fontWeight: font.medium, marginTop: 4, marginBottom: spacing.lg, ...rtlText },
  progressCard: { gap: spacing.md },
  progressRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  progressTitle: { fontSize: 15, fontWeight: font.black, color: colors.text, ...rtlText },
  progressSub: { fontSize: 12.5, color: colors.textMuted, fontWeight: font.medium, marginTop: 2, ...rtlText },
  pct: { fontSize: 18, fontWeight: font.black, color: colors.primary },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowTitle: { fontSize: 15.5, fontWeight: font.bold, color: colors.text, ...rtlText },
  rowMeta: { fontSize: 12.5, color: colors.textMuted, fontWeight: font.medium, marginTop: 3, ...rtlText },
});
