/**
 * Assessment — mirrors the web `/assessment` flow: start a session, answer each
 * question on a 0–4 scale (one at a time with a progress bar), submit, then show
 * the result (score + trauma level) which is persisted so exercises unlock.
 * Pushed as a page (RTL back button in the header).
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header, Screen } from '../components/Screen';
import { Card, GradientButton, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { ClipboardIcon, HeartIcon, SparklesIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import {
  AssessmentQuestion,
  AssessmentResult,
  getAssessmentQuestions,
  startAssessment,
  submitAssessment,
} from '../lib/api';

const OPTIONS = [
  { score: 0, label: 'اصلاً', color: '#94a3b8' },
  { score: 1, label: 'کمی', color: '#10b981' },
  { score: 2, label: 'متوسط', color: '#f59e0b' },
  { score: 3, label: 'خیلی', color: '#f97316' },
  { score: 4, label: 'فوق‌العاده زیاد', color: '#f43f5e' },
];

const toFa = (n: number | string) => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const TRAUMA: Record<string, { fa: string; tint: readonly [string, string] }> = {
  mild: { fa: 'ترومای خفیف', tint: gradients.teal },
  moderate: { fa: 'ترومای متوسط', tint: gradients.amber },
  severe: { fa: 'ترومای شدید', tint: ['#f97316', '#ef4444'] as const },
  complex: { fa: 'ترومای پیچیده', tint: ['#ef4444', '#be123c'] as const },
};

function interpret(score: number): string {
  if (score <= 20) return 'علائم خفیف است. تمرین‌های آرام‌سازی و تنفس منظم به حفظ این آرامش کمک می‌کند.';
  if (score <= 32) return 'علائم متوسطی را تجربه می‌کنی. تمرین‌های تثبیت ذهن و ایجاد حس ایمنی در بدن مفید است.';
  if (score <= 50) return 'علائم شدیدی داری که احتمالاً روی زندگی روزمره اثر گذاشته. تمرین‌های تخصصی همراه با حمایت عاطفی توصیه می‌شود.';
  return 'درگیر ترومای پیچیده و علائم بسیار شدیدی هستی. پیشنهاد می‌شود حتماً با یک روان‌درمانگر متخصص تروما صحبت کنی.';
}

export const AssessmentScreen: React.FC = () => {
  const { pop, switchTab } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentId, setAssessmentId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const start = async () => {
    setLoading(true);
    setError('');
    try {
      const s = await startAssessment();
      setAssessmentId(s.assessment_info.id);
      const q = await getAssessmentQuestions();
      setQuestions(q.questions || []);
    } catch {
      setError('خطا در شروع ارزیابی. لطفاً اتصال و بالا بودن سرور را بررسی کن.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
  }, []);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  const answer = async (score: number) => {
    if (!current) return;
    const next = { ...answers, [String(current.id)]: score };
    setAnswers(next);
    if (isLast) {
      setSubmitting(true);
      try {
        const res = await submitAssessment(assessmentId, next);
        setResult(res);
      } catch {
        setError('خطا در ثبت پاسخ‌ها. دوباره تلاش کن.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setIndex(i => i + 1);
    }
  };

  // ---- Result view ----
  if (result) {
    const info = TRAUMA[result.trauma_type] || { fa: 'نامشخص', tint: gradients.violet };
    return (
      <View style={styles.fill}>
        <Header title="گزارش وضعیت تو" onBack={pop} />
        <Screen contentStyle={{ paddingTop: 0 }}>
          <View style={styles.resultHead}>
            <Gradient colors={gradients.violet} style={styles.resultIcon}>
              <SparklesIcon size={32} color={colors.white} />
            </Gradient>
            <Text style={styles.resultTitle}>تحلیل پاسخ‌های تو انجام شد</Text>
          </View>

          <Card style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>امتیاز کلی</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>{toFa(result.total_score)}</Text>
              <Text style={styles.scoreMax}>/ ۸۰</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${Math.min(100, (result.total_score / 80) * 100)}%` }]} />
            </View>
          </Card>

          <Gradient colors={info.tint} angle={130} style={styles.typeCard}>
            <Text style={styles.typeKicker}>تشخیص سیستم</Text>
            <Text style={styles.typeValue}>{info.fa}</Text>
          </Gradient>

          <Card style={styles.interpretCard}>
            <Text style={styles.interpretTitle}>تفسیر نتیجه</Text>
            <Text style={styles.interpretText}>{interpret(result.total_score)}</Text>
          </Card>

          <GradientButton
            label="تمرین‌های پیشنهادی"
            colors={gradients.violet}
            onPress={() => {
              pop();
              switchTab('exercises');
            }}
            style={{ marginTop: spacing.lg }}
          />
          <PressableScale onPress={pop} scaleTo={0.98} style={{ marginTop: spacing.md }}>
            <View style={styles.homeBtn}>
              <Text style={styles.homeBtnText}>بازگشت</Text>
            </View>
          </PressableScale>
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Header title="ارزیابی وضعیت روحی" onBack={pop} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.centerText}>در حال آماده‌سازی ارزیابی...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <GradientButton label="تلاش مجدد" colors={gradients.violet} onPress={start} style={{ marginTop: spacing.lg }} />
        </View>
      ) : (
        <Screen contentStyle={{ paddingTop: 0 }}>
          {/* Progress */}
          <Card style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View style={styles.progressHead}>
                <View style={styles.progIcon}>
                  <ClipboardIcon size={20} color={colors.primary} />
                </View>
                <Text style={styles.progressSub}>
                  سوال {toFa(index + 1)} از {toFa(questions.length)}
                </Text>
              </View>
              <View style={styles.pctBadge}>
                <Text style={styles.pctText}>٪{toFa(Math.round(progress))}</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${progress}%` }]} />
            </View>
          </Card>

          {/* Question */}
          <QuestionCard key={index}>
            <View style={styles.qHead}>
              <View style={styles.qIcon}>
                <HeartIcon size={22} color={colors.primary} />
              </View>
              <Text style={styles.qText}>{current?.text}</Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              {OPTIONS.map(o => (
                <PressableScale key={o.score} onPress={submitting ? undefined : () => answer(o.score)} scaleTo={0.98}>
                  <View style={styles.option}>
                    <Text style={styles.optionLabel}>{o.label}</Text>
                    <View style={[styles.optionBadge, { backgroundColor: o.color }]}>
                      <Text style={styles.optionScore}>{toFa(o.score)}</Text>
                    </View>
                  </View>
                </PressableScale>
              ))}
            </View>
          </QuestionCard>

          {/* Prev */}
          <View style={styles.navRow}>
            <PressableScale
              onPress={index === 0 || submitting ? undefined : () => setIndex(i => i - 1)}
              scaleTo={0.95}>
              <View style={[styles.prevBtn, (index === 0 || submitting) && styles.prevDisabled]}>
                <Text style={styles.prevText}>قبلی</Text>
              </View>
            </PressableScale>
            <Text style={styles.navHint}>یکی از گزینه‌ها را انتخاب کن</Text>
          </View>

          {/* Safety note */}
          <Card style={styles.safety}>
            <Text style={styles.safetyText}>
              اگر حین پاسخ‌گویی احساس ناراحتی کردی، می‌توانی ارزیابی را متوقف کنی. خط کمک: ۱۲۳
            </Text>
          </Card>

          {submitting ? (
            <View style={styles.submitOverlay}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.centerText}>در حال تحلیل پاسخ‌ها...</Text>
            </View>
          ) : null}
        </Screen>
      )}
    </View>
  );
};

/** Slides the question card in on change. */
const QuestionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}>
      <Card style={styles.qCard}>{children}</Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  centerText: { fontSize: 14, color: colors.textMuted, ...rtlText },
  errorText: { fontFamily: font.family, fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 26, ...{ writingDirection: 'rtl' as const } },
  progressCard: { gap: spacing.md, marginBottom: spacing.lg },
  progressTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  progressHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  progIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  progressSub: { fontSize: 13, color: colors.textMuted,  ...rtlText },
  pctBadge: { backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5 },
  pctText: { fontFamily: font.family, fontSize: 12, color: colors.primary },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  qCard: { gap: spacing.lg, marginBottom: spacing.lg },
  qHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  qIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  qText: { flex: 1, fontSize: 18,  color: colors.text, lineHeight: 28, ...rtlText },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  optionLabel: { fontSize: 16,  color: colors.textBody, ...rtlText },
  optionBadge: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  optionScore: { fontFamily: font.family, color: colors.white, fontSize: 14 },
  navRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  prevBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: 12 },
  prevDisabled: { opacity: 0.4 },
  prevText: { fontSize: 14,  color: colors.textMuted, ...rtlText },
  navHint: { fontSize: 11,  color: colors.textFaint, ...rtlText },
  safety: { backgroundColor: colors.warmTint, borderColor: '#fde68a' },
  safetyText: { fontFamily: font.family, fontSize: 13, color: '#92600a', textAlign: 'center', lineHeight: 22, ...{ writingDirection: 'rtl' as const } },
  submitOverlay: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  // result
  resultHead: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  resultIcon: { width: 74, height: 74, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadow.soft },
  resultTitle: { fontSize: 16,  color: colors.textMuted, ...rtlText },
  scoreCard: { alignItems: 'center', gap: spacing.md },
  scoreLabel: { fontSize: 12,  color: colors.textFaint, letterSpacing: 1, ...rtlText },
  scoreRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6 },
  scoreValue: { fontFamily: font.family, fontSize: 56, color: colors.text },
  scoreMax: { fontFamily: font.family, fontSize: 18, color: colors.textFaint },
  typeCard: { borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.lg, overflow: 'hidden', ...shadow.floating },
  typeKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 12,  ...rtlText },
  typeValue: { color: colors.white, fontSize: 26,  marginTop: 6, ...rtlText },
  interpretCard: { marginTop: spacing.lg, gap: spacing.sm },
  interpretTitle: { fontSize: 15.5,  color: colors.text, ...rtlText },
  interpretText: { fontSize: 14, color: colors.textMuted,  lineHeight: 26, ...rtlText },
  homeBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  homeBtnText: { fontSize: 15,  color: colors.text, ...rtlText },
});
