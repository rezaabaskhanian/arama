/**
 * Journal tab — a gentle prompt card plus a list of past entries. Tapping an
 * entry (or the prompt) opens the detail page.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, rtlText, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, GradientButton, IconTile, PressableScale } from '../components/ui';
import { BookIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

const entries = [
  { key: 'j1', date: 'امروز · ۱۰:۳۰', title: 'یک لحظه‌ی آرام', excerpt: 'صبح کنار پنجره نشستم و فقط نفس کشیدم…' },
  { key: 'j2', date: 'دیروز · ۲۱:۱۵', title: 'چیزی که ممنونش بودم', excerpt: 'تماس یک دوست قدیمی حالم را بهتر کرد.' },
  { key: 'j3', date: 'دوشنبه · ۰۸:۴۵', title: 'قدم کوچک', excerpt: 'امروز تمرین تنفس را تا آخر انجام دادم.' },
];

export const JournalScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Text style={styles.h1}>ژورنال من</Text>
      <Text style={styles.p}>افکارت را رها کن؛ اینجا فقط برای توست.</Text>

      <Card style={styles.prompt}>
        <IconTile colors={gradients.amber}>
          <BookIcon size={24} color={colors.white} />
        </IconTile>
        <Text style={styles.promptTitle}>پرسش امروز</Text>
        <Text style={styles.promptText}>
          امروز چه چیز کوچکی به تو حس امنیت داد؟
        </Text>
        <GradientButton
          label="نوشتن"
          colors={gradients.amber}
          onPress={() => push('detail', { key: 'journal', title: 'نوشته‌ی جدید' })}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      <Text style={styles.section}>نوشته‌های پیشین</Text>

      {entries.map(e => (
        <PressableScale key={e.key} onPress={() => push('detail', { key: 'journal', title: e.title })}>
          <Card style={styles.entry}>
            <Text style={styles.entryDate}>{e.date}</Text>
            <Text style={styles.entryTitle}>{e.title}</Text>
            <Text style={styles.entryExcerpt} numberOfLines={1}>
              {e.excerpt}
            </Text>
          </Card>
        </PressableScale>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: font.black, color: colors.text, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted, fontWeight: font.medium, marginTop: 4, marginBottom: spacing.lg, ...rtlText },
  prompt: { gap: spacing.sm },
  promptTitle: { fontSize: 13, color: colors.warning, fontWeight: font.black, marginTop: spacing.sm, ...rtlText },
  promptText: { fontSize: 17, color: colors.text, fontWeight: font.bold, lineHeight: 28, ...rtlText },
  section: {
    fontSize: 16,
    fontWeight: font.black,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...rtlText,
  },
  entry: { marginBottom: spacing.md, gap: 4 },
  entryDate: { fontSize: 11.5, color: colors.textFaint, fontWeight: font.medium, ...rtlText },
  entryTitle: { fontSize: 16, color: colors.text, fontWeight: font.black, ...rtlText },
  entryExcerpt: { fontSize: 13, color: colors.textMuted, fontWeight: font.medium, ...rtlText },
});
