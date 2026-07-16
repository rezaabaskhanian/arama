/**
 * Commitments ("تمرین‌های واقعی زندگی") — mirrors the web /commitments page.
 * Two tabs: discover templates → pledge; mine → complete or cancel.
 * Gate: requires N completed exercises before templates are accessible.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header } from '../components/Screen';
import { Card, GradientButton, IconTile, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  CheckIcon,
  ClockIcon,
  HeartHandshakeIcon,
  LockIcon,
  SparklesIcon,
  TargetIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import {
  cancelCommitment,
  Commitment,
  CommitmentTemplate,
  completeCommitment,
  getCommitmentTemplates,
  getMyCommitments,
  pledgeCommitment,
} from '../lib/api';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

const CATEGORY_LABELS: Record<string, string> = {
  community: 'اجتماعی',
  nature: 'طبیعت',
  family: 'خانواده',
  kindness: 'نوع‌دوستی',
  travel: 'سفر',
};

const CATEGORY_COLORS: Record<string, readonly [string, string]> = {
  community: ['#9a86d6', '#574098'],
  nature:    ['#34d399', '#059669'],
  family:    ['#fbbf24', '#f59e0b'],
  kindness:  ['#fb7185', '#e11d48'],
  travel:    ['#7e66c6', '#47367b'],
};

const toFa = (n: number | string) =>
  String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const CommitmentsScreen: React.FC = () => {
  const { pop, push } = useNavigation();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'discover' | 'mine'>('discover');
  const [templates, setTemplates] = useState<CommitmentTemplate[]>([]);
  const [gate, setGate] = useState({ unlocked: true, completed: 0, required: 0 });
  const [mine, setMine] = useState<Commitment[]>([]);

  // pledge modal
  const [pledgeTarget, setPledgeTarget] = useState<CommitmentTemplate | null>(null);
  const [moodBefore, setMoodBefore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // complete modal
  const [completeTarget, setCompleteTarget] = useState<Commitment | null>(null);
  const [moodAfter, setMoodAfter] = useState(0);
  const [reflection, setReflection] = useState('');

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [t, m] = await Promise.all([getCommitmentTemplates(), getMyCommitments()]);
      setTemplates(t.templates || []);
      setGate({ unlocked: t.unlocked, completed: t.completed_exercises, required: t.required_exercises });
      setMine(m);
    } catch (e: any) {
      setError(e?.message || 'خطا در بارگذاری');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePledge = async () => {
    if (!pledgeTarget) return;
    try {
      setSubmitting(true);
      await pledgeCommitment(pledgeTarget.id, moodBefore);
      setPledgeTarget(null);
      setMoodBefore(0);
      await load();
      setTab('mine');
    } catch (e: any) {
      setError(e?.message || 'خطا');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!completeTarget || !moodAfter) { setError('لطفاً حس‌وحالت را انتخاب کن'); return; }
    try {
      setSubmitting(true);
      await completeCommitment(completeTarget.id, moodAfter, reflection);
      setCompleteTarget(null);
      setMoodAfter(0);
      setReflection('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'خطا');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelCommitment(id);
      await load();
    } catch (e: any) {
      setError(e?.message || 'خطا');
    }
  };

  const activeCount = mine.filter(m => m.status === 'pledged').length;
  const doneCount   = mine.filter(m => m.status === 'completed').length;

  return (
    <View style={styles.root}>
      <Header title="تمرین‌های واقعی زندگی" onBack={pop} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <IconTile colors={gradients.violet} size={44}>
              <ClockIcon size={20} color={colors.white} />
            </IconTile>
            <View>
              <Text style={styles.statNum}>{toFa(activeCount)}</Text>
              <Text style={styles.statLabel}>تعهد فعال</Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <IconTile colors={['#34d399', '#059669']} size={44}>
              <CheckIcon size={20} color={colors.white} />
            </IconTile>
            <View>
              <Text style={styles.statNum}>{toFa(doneCount)}</Text>
              <Text style={styles.statLabel}>انجام‌شده</Text>
            </View>
          </Card>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['discover', 'mine'] as const).map(t => (
            <PressableScale key={t} onPress={() => setTab(t)} scaleTo={0.95} style={styles.tabBtn}>
              {tab === t ? (
                <Gradient colors={gradients.violet} style={styles.tabActive}>
                  <Text style={styles.tabTextActive}>
                    {t === 'discover' ? 'کشف تمرین‌ها' : `تعهدهای من (${toFa(mine.length)})`}
                  </Text>
                </Gradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabText}>
                    {t === 'discover' ? 'کشف تمرین‌ها' : `تعهدهای من (${toFa(mine.length)})`}
                  </Text>
                </View>
              )}
            </PressableScale>
          ))}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : tab === 'discover' ? (
          <DiscoverTab
            templates={templates}
            gate={gate}
            onPledge={t => { setPledgeTarget(t); setMoodBefore(0); }}
            onGoExercises={() => push('exercises')}
          />
        ) : (
          <MineTab
            mine={mine}
            onComplete={c => { setCompleteTarget(c); setMoodAfter(0); setReflection(''); }}
            onCancel={handleCancel}
            onDiscover={() => setTab('discover')}
          />
        )}
      </ScrollView>

      {/* Pledge modal */}
      <Modal visible={!!pledgeTarget} transparent animationType="slide" onRequestClose={() => setPledgeTarget(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>به خودت قول بده</Text>
            {pledgeTarget && <Text style={styles.modalSub}>{pledgeTarget.title}</Text>}
            <Text style={styles.modalHint}>حس‌وحالت همین حالا چطوره؟ (اختیاری)</Text>
            <View style={styles.moodRow}>
              {MOODS.map((em, i) => (
                <PressableScale key={i} onPress={() => setMoodBefore(i + 1)} scaleTo={0.9}>
                  <View style={[styles.moodBtn, moodBefore === i + 1 && styles.moodBtnActive]}>
                    <Text style={styles.moodEmoji}>{em}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPledgeTarget(null)}>
                <Text style={styles.cancelBtnText}>انصراف</Text>
              </TouchableOpacity>
              <GradientButton
                label={submitting ? '...' : 'ثبت تعهد'}
                onPress={handlePledge}
                colors={gradients.violet}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete modal */}
      <Modal visible={!!completeTarget} transparent animationType="slide" onRequestClose={() => setCompleteTarget(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>حالا حست چطوره؟</Text>
            <Text style={styles.modalHint}>بعد از انجام این کار چه حسی داری؟</Text>
            <View style={styles.moodRow}>
              {MOODS.map((em, i) => (
                <PressableScale key={i} onPress={() => setMoodAfter(i + 1)} scaleTo={0.9}>
                  <View style={[styles.moodBtn, moodAfter === i + 1 && styles.moodBtnActiveGreen]}>
                    <Text style={styles.moodEmoji}>{em}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
            <TextInput
              style={styles.reflectionInput}
              value={reflection}
              onChangeText={setReflection}
              placeholder="تجربه‌ات را بنویس... چه چیزی در تو تغییر کرد؟"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCompleteTarget(null)}>
                <Text style={styles.cancelBtnText}>بعداً</Text>
              </TouchableOpacity>
              <GradientButton
                label={submitting ? '...' : 'ثبت بازخورد'}
                onPress={handleComplete}
                colors={['#34d399', '#059669']}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---------- Sub-components ----------

const DiscoverTab: React.FC<{
  templates: CommitmentTemplate[];
  gate: { unlocked: boolean; completed: number; required: number };
  onPledge: (t: CommitmentTemplate) => void;
  onGoExercises: () => void;
}> = ({ templates, gate, onPledge, onGoExercises }) => (
  <View style={{ gap: spacing.md }}>
    {!gate.unlocked && (
      <View style={styles.gateBox}>
        <View style={styles.gateTileWrap}>
          <LockIcon size={24} color="#f59e0b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.gateTitle}>این بخش هنوز قفل است 🔒</Text>
          <Text style={styles.gateSub}>
            اول {toFa(gate.required)} تمرین شفابخش را کامل کن تا این بخش باز شود.
          </Text>
          <View style={styles.gateTrackWrap}>
            <View style={styles.gateTrack}>
              <View style={[styles.gateFill, { width: `${gate.required ? Math.min(100, (gate.completed / gate.required) * 100) : 0}%` }]} />
            </View>
            <Text style={styles.gateCount}>{toFa(gate.completed)} از {toFa(gate.required)}</Text>
          </View>
          <TouchableOpacity style={styles.gateBtn} onPress={onGoExercises}>
            <Text style={styles.gateBtnText}>رفتن به تمرین‌های شفابخش</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}

    {templates.map(t => {
      const catColors = CATEGORY_COLORS[t.category] || gradients.violet;
      const catLabel  = CATEGORY_LABELS[t.category] || t.category;
      return (
        <Card key={t.id} style={styles.templateCard}>
          <View style={styles.templateRow}>
            <IconTile colors={catColors} size={52}>
              <SparklesIcon size={22} color={colors.white} />
            </IconTile>
            <View style={{ flex: 1 }}>
              <View style={styles.templateTitleRow}>
                <Text style={styles.templateTitle}>{t.title}</Text>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{catLabel}</Text>
                </View>
              </View>
              <Text style={styles.templateDesc}>{t.description}</Text>
              {t.duration_hint ? (
                <View style={styles.durationRow}>
                  <ClockIcon size={13} color={colors.textFaint} />
                  <Text style={styles.durationText}>{t.duration_hint}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.templateFooter}>
            {gate.unlocked ? (
              <GradientButton
                label="این کار را انجام می‌دهم"
                onPress={() => onPledge(t)}
                colors={catColors}
                icon={<TargetIcon size={16} color={colors.white} />}
              />
            ) : (
              <View style={styles.lockedBadge}>
                <LockIcon size={14} color={colors.textFaint} />
                <Text style={styles.lockedText}>قفل</Text>
              </View>
            )}
          </View>
        </Card>
      );
    })}
  </View>
);

const MineTab: React.FC<{
  mine: Commitment[];
  onComplete: (c: Commitment) => void;
  onCancel: (id: string) => void;
  onDiscover: () => void;
}> = ({ mine, onComplete, onCancel, onDiscover }) => {
  if (mine.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <TargetIcon size={40} color={colors.textFaint} />
        <Text style={styles.emptyTitle}>هنوز تعهدی نداری</Text>
        <Text style={styles.emptyDesc}>از «کشف تمرین‌ها» یک تمرین انتخاب کن و به خودت قول بده.</Text>
        <GradientButton label="شروع کن" onPress={onDiscover} colors={gradients.violet} />
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {mine.map(c => {
        const done      = c.status === 'completed';
        const cancelled = c.status === 'cancelled';
        const catLabel  = CATEGORY_LABELS[c.category] || c.category;
        const catColors = CATEGORY_COLORS[c.category] || gradients.violet;
        return (
          <Card key={c.id} style={[styles.mineCard, cancelled && styles.mineCardFaded]}>
            <View style={styles.mineHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.mineHeaderTop}>
                  <View style={[styles.catBadge, { backgroundColor: catColors[0] + '22' }]}>
                    <Text style={[styles.catBadgeText, { color: catColors[0] }]}>{catLabel}</Text>
                  </View>
                  {done ? (
                    <View style={styles.doneBadge}>
                      <CheckIcon size={12} color={colors.calmDark} />
                      <Text style={styles.doneBadgeText}>انجام‌شد</Text>
                    </View>
                  ) : cancelled ? (
                    <View style={styles.cancelledBadge}>
                      <Text style={styles.cancelledText}>لغوشده</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <ClockIcon size={12} color={colors.warm} />
                      <Text style={styles.pendingText}>در انتظار</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.mineTitle}>{c.title}</Text>
              </View>
            </View>

            {done && (
              <View style={styles.doneDetail}>
                {c.reflection ? (
                  <Text style={styles.reflectionText}>«{c.reflection}»</Text>
                ) : null}
                <View style={styles.moodDeltaRow}>
                  {c.mood_before ? <Text style={styles.moodDeltaText}>قبل: {MOODS[(c.mood_before ?? 1) - 1]}</Text> : null}
                  {c.mood_after  ? <Text style={styles.moodDeltaText}>بعد: {MOODS[(c.mood_after  ?? 1) - 1]}</Text> : null}
                  {c.mood_delta && c.mood_delta > 0 ? (
                    <Text style={styles.moodImproved}>حال بهتر ↑{toFa(c.mood_delta)}</Text>
                  ) : null}
                </View>
              </View>
            )}

            {!done && !cancelled && (
              <View style={styles.mineActions}>
                <TouchableOpacity style={styles.cancelCircle} onPress={() => onCancel(c.id)}>
                  <Text style={styles.cancelCircleText}>لغو</Text>
                </TouchableOpacity>
                <GradientButton
                  label="انجامش دادم"
                  onPress={() => onComplete(c)}
                  colors={['#34d399', '#059669']}
                  icon={<HeartHandshakeIcon size={16} color={colors.white} />}
                />
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
};

// ---------- Styles ----------

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },

  statsRow: { flexDirection: 'row-reverse', gap: spacing.md },
  statCard: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  statNum: { fontSize: 22, color: colors.text, fontFamily: font.family },
  statLabel: { fontSize: 12, color: colors.textMuted, ...rtlText },

  tabs: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 6,
    gap: 6,
    ...shadow.card,
  },
  tabBtn: { flex: 1 },
  tabActive: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  tabInactive: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  tabTextActive: { fontFamily: font.family, color: colors.white, fontSize: 13 },
  tabText: { fontFamily: font.family, color: colors.textMuted, fontSize: 13 },

  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { fontFamily: font.family, color: colors.danger, textAlign: 'center' },

  // gate
  gateBox: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  gateTileWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateTitle: { color: '#92400e', fontSize: 14, ...rtlText },
  gateSub: { color: '#a16207', fontSize: 12, marginTop: 4, lineHeight: 20, ...rtlText },
  gateTrackWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  gateTrack: { flex: 1, height: 8, backgroundColor: '#fde68a', borderRadius: radius.pill, overflow: 'hidden' },
  gateFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: radius.pill },
  gateCount: { fontFamily: font.family, fontSize: 11, color: '#a16207' },
  gateBtn: {
    marginTop: spacing.md,
    backgroundColor: '#f59e0b',
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  gateBtnText: { fontFamily: font.family, color: colors.white, fontSize: 13 },

  // templates
  templateCard: { gap: spacing.md },
  templateRow: { flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'flex-start' },
  templateTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  templateTitle: { fontSize: 15, color: colors.text, ...rtlText, flexShrink: 1 },
  templateDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 4, ...rtlText },
  durationRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 6 },
  durationText: { fontFamily: font.family, fontSize: 12, color: colors.textFaint },
  templateFooter: { alignItems: 'flex-end' },
  lockedBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  lockedText: { fontFamily: font.family, fontSize: 13, color: colors.textFaint },

  catBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  catBadgeText: { fontFamily: font.family, fontSize: 11, color: colors.primary },

  // mine
  mineCard: { gap: spacing.sm },
  mineCardFaded: { opacity: 0.55 },
  mineHeader: { flexDirection: 'row-reverse', gap: spacing.md },
  mineHeaderTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  mineTitle: { fontSize: 15, color: colors.text, ...rtlText },

  doneBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: colors.calmSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  doneBadgeText: { fontFamily: font.family, fontSize: 11, color: colors.calmDark },
  cancelledBadge: { backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  cancelledText: { fontFamily: font.family, fontSize: 11, color: colors.textFaint },
  pendingBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pendingText: { fontFamily: font.family, fontSize: 11, color: '#a16207' },

  doneDetail: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md, gap: 6 },
  reflectionText: { fontSize: 13, color: colors.textBody, lineHeight: 20, ...rtlText },
  moodDeltaRow: { flexDirection: 'row-reverse', gap: spacing.md },
  moodDeltaText: { fontFamily: font.family, fontSize: 12, color: colors.textMuted },
  moodImproved: { fontFamily: font.family, fontSize: 12, color: colors.calmDark },

  mineActions: { flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center' },
  cancelCircle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  cancelCircleText: { fontFamily: font.family, fontSize: 13, color: colors.textMuted },

  // empty
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.lg },
  emptyTitle: { fontSize: 16, color: colors.text, ...rtlText },
  emptyDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 22, ...rtlText, textAlign: 'center' },

  // modals
  modalBg: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: { fontFamily: font.family, fontSize: 18, color: colors.text, textAlign: 'center' },
  modalSub: { fontSize: 14, color: colors.textMuted, ...rtlText, textAlign: 'center' },
  modalHint: { fontSize: 13, color: colors.textMuted, ...rtlText },
  moodRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  moodBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnActive: { backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary },
  moodBtnActiveGreen: { backgroundColor: colors.calmSoft, borderWidth: 2, borderColor: colors.calm },
  moodEmoji: { fontSize: 24 },
  reflectionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: font.family,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalActions: { flexDirection: 'row-reverse', gap: spacing.sm },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: font.family, fontSize: 14, color: colors.textMuted },
});
