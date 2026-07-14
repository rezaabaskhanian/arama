/**
 * Journal tab — a gentle prompt + inline composer that writes to the API
 * (createJournalEntry), and a list of past entries loaded from the backend
 * (getJournalEntries). Mirrors the web dictionary/journal flow.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, GradientButton, IconTile } from '../components/ui';
import { BookIcon } from '../icons';
import { createJournalEntry, getJournalEntries, JournalEntry } from '../lib/api';

const MOOD_EMOJI = ['😣', '😔', '😐', '🙂', '😊', '😄'];

function normalize(data: any): JournalEntry[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.entries)) return data.entries;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.journals)) return data.journals;
  return [];
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export const JournalScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getJournalEntries(1, 20);
      setEntries(normalize(data));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await createJournalEntry(text.trim(), 3);
      setText('');
      await load();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      <Text style={styles.h1}>ژورنال من</Text>
      <Text style={styles.p}>افکارت را رها کن؛ اینجا فقط برای توست.</Text>

      <Card style={styles.prompt}>
        <IconTile colors={gradients.amber}>
          <BookIcon size={24} color={colors.white} />
        </IconTile>
        <Text style={styles.promptTitle}>پرسش امروز</Text>
        <Text style={styles.promptText}>امروز چه چیز کوچکی به تو حس امنیت داد؟</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="اینجا بنویس…"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
        <GradientButton
          label={saving ? 'در حال ثبت...' : 'ثبت نوشته'}
          colors={gradients.amber}
          onPress={submit}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      <Text style={styles.section}>نوشته‌های پیشین</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
      ) : entries.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyText}>هنوز نوشته‌ای ثبت نکرده‌ای. اولین نوشته‌ات را بنویس 🌿</Text>
        </Card>
      ) : (
        entries.map((e, i) => (
          <Card key={e.id || i} style={styles.entry}>
            <View style={styles.entryHead}>
              {typeof e.mood === 'number' ? (
                <Text style={styles.entryMood}>{MOOD_EMOJI[e.mood] || '🙂'}</Text>
              ) : null}
              <Text style={styles.entryDate}>{formatDate(e.created_at)}</Text>
            </View>
            <Text style={styles.entryContent} numberOfLines={3}>
              {e.content}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 26,  color: colors.text, ...rtlText },
  p: { fontSize: 14, color: colors.textMuted,  marginTop: 4, marginBottom: spacing.lg, ...rtlText },
  prompt: { gap: spacing.sm },
  promptTitle: { fontSize: 13, color: colors.warning,  marginTop: spacing.sm, ...rtlText },
  promptText: { fontSize: 17, color: colors.text,  lineHeight: 28, ...rtlText },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    fontSize: 14.5,
    color: colors.text,
    
    textAlignVertical: 'top',
    marginTop: spacing.sm,
    ...rtlText,
  },
  section: { fontSize: 16,  color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md, ...rtlText },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { fontFamily: font.family, fontSize: 13.5, color: colors.textMuted, textAlign: 'center', lineHeight: 24, ...{ writingDirection: 'rtl' as const } },
  entry: { marginBottom: spacing.md, gap: spacing.sm },
  entryHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  entryMood: { fontSize: 18 },
  entryDate: { fontSize: 11.5, color: colors.textFaint,  ...rtlText },
  entryContent: { fontSize: 14, color: colors.text,  lineHeight: 24, ...rtlText },
});
