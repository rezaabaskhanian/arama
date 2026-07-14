/**
 * Home tab — the mobile take on the web dashboard: a warm greeting, a hero CTA,
 * a recovery stats strip, personalised suggested exercises (from the API),
 * quick "gateway" shortcuts, and a rotating self-care quote.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, IconTile, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  ActivityIcon,
  BellIcon,
  BookIcon,
  ClipboardIcon,
  FlameIcon,
  QuoteIcon,
  RefreshIcon,
  TargetIcon,
  UserIcon,
  WindIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';
import { useAuth } from '../context/AuthContext';
import {
  DashboardStats,
  ExerciseItem,
  getDashboardStats,
  getSuggestedExercises,
  getSupervisionMessages,
} from '../lib/api';
import { getItem, StorageKeys } from '../lib/storage';

const QUOTES = [
  { text: 'شجاعت یعنی هر روز دوباره انتخاب کنی که خودت را دوست داشته باشی.', by: 'برنه براون' },
  { text: 'شفا یعنی دیگر آسیب کنترل زندگی‌ات را در دست ندارد.', by: 'خرد درون تو' },
  { text: 'تو مجبور نیستی طوفان را کنترل کنی؛ کافی است در دلش آرام بمانی.', by: 'ناشناس' },
  { text: 'هر نفس عمیق، پیامی است به بدن تو: اکنون در امان هستی.', by: 'آرامینا' },
];

const greetingFor = (h: number) => (h < 12 ? 'صبح بخیر' : h < 18 ? 'عصر بخیر' : 'شب بخیر');

const toFa = (n: number | string) =>
  String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push, switchTab, stack } = useNavigation();
  const { user } = useAuth();

  const [unread, setUnread] = useState(0);

  const [loading, setLoading] = useState(true);
  const [suggested, setSuggested] = useState<ExerciseItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const greeting = useMemo(() => greetingFor(new Date().getHours()), []);

  useEffect(() => {
    (async () => {
      const trauma = (await getItem(StorageKeys.traumaType)) || 'mild';
      const [ex, dash] = await Promise.all([
        getSuggestedExercises(2),
        getDashboardStats(trauma),
      ]);
      setSuggested(ex);
      setStats(dash);
      setLoading(false);
    })();
  }, []);

  // Recompute the unread badge whenever Home becomes visible again (stack empties).
  useEffect(() => {
    if (stack.length !== 0) return;
    (async () => {
      const [msgs, seen] = await Promise.all([
        getSupervisionMessages(),
        getItem(StorageKeys.messagesSeenAt),
      ]);
      const seenTime = seen ? new Date(seen).getTime() : 0;
      setUnread(msgs.filter(m => new Date(m.created_at).getTime() > seenTime).length);
    })();
  }, [stack.length]);

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      {/* Greeting */}
      <View style={styles.topRow}>
        <PressableScale onPress={() => push('profile')} scaleTo={0.92}>
          <Gradient colors={gradients.violet} style={styles.avatarBtn}>
            <UserIcon size={22} color={colors.white} />
          </Gradient>
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Text style={styles.hi}>
            {greeting}
            {user?.name ? `، ${user.name} عزیز` : '، همراه عزیز'} 🌿
          </Text>
          <Text style={styles.sub}>امروز حالت چطوره؟</Text>
        </View>
        <PressableScale onPress={() => push('messages')} scaleTo={0.9}>
          <View style={styles.bell}>
            <BellIcon size={22} color={colors.primary} />
            {unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '۹+' : toFa(unread)}</Text>
              </View>
            ) : null}
          </View>
        </PressableScale>
      </View>

      {/* Hero */}
      <FadeIn delay={60}>
        <Gradient colors={gradients.violet} angle={130} style={styles.hero}>
          <Text style={styles.heroKicker}>{greeting} ✨</Text>
          <Text style={styles.heroTitle}>با آنچه از سر می‌گذرانی، رشد کن 🌿</Text>
          <Text style={styles.heroDesc}>هر روز یک قدم کوچک برای آرامش و رشد.</Text>
          <PressableScale onPress={() => switchTab('exercises')} scaleTo={0.97}>
            <View style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>تمرین امروزت را شروع کن</Text>
            </View>
          </PressableScale>
        </Gradient>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={120}>
        <Card style={styles.statsCard}>
          <Stat value={toFa(stats?.completed_exercises ?? 0)} label="تمرین تکمیل‌شده" />
          <View style={styles.statDivider} />
          <Stat value={toFa(stats?.streak ?? 0)} label="روز پیاپی" flame />
          <View style={styles.statDivider} />
          <Stat value={toFa(stats?.journal_entries ?? 0)} label="نوشته" />
        </Card>
      </FadeIn>

      {/* Suggested exercises */}
      <View style={styles.sectionRow}>
        <PressableScale onPress={() => switchTab('exercises')}>
          <Text style={styles.sectionLink}>مشاهده همه</Text>
        </PressableScale>
        <Text style={styles.section}>پیشنهادهای مخصوص تو</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
      ) : suggested.length ? (
        suggested.map((ex, i) => {
          const info = ex.exercise_info || ex;
          return (
            <FadeIn key={info.id || i} delay={160 + i * 60}>
              <PressableScale onPress={() => push('exercise', { id: info.id })}>
                <Card style={styles.exRow}>
                  <View style={styles.exStart}>
                    <Text style={styles.exStartText}>{info.is_completed ? 'بازبینی' : 'شروع'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exTitle} numberOfLines={1}>{info.title}</Text>
                    <Text style={styles.exMeta}>
                      {toFa(info.duration ?? 0)} دقیقه · {info.trauma_type || ''}
                    </Text>
                  </View>
                  <IconTile colors={info.is_completed ? gradients.teal : gradients.violet} size={46}>
                    <WindIcon size={22} color={colors.white} />
                  </IconTile>
                </Card>
              </PressableScale>
            </FadeIn>
          );
        })
      ) : (
        <Card style={styles.empty}>
          <ClipboardIcon size={30} color={colors.primary} />
          <Text style={styles.emptyTitle}>ابتدا ارزیابی را انجام بده</Text>
          <Text style={styles.emptyText}>
            تمرین‌های شفابخش تا وقتی ارزیابی وضعیت را کامل نکرده‌ای باز نمی‌شوند.
          </Text>
          <PressableScale onPress={() => push('assessment')} scaleTo={0.97}>
            <View style={styles.emptyBtn}>
              <ClipboardIcon size={18} color={colors.white} />
              <Text style={styles.emptyBtnText}>شروع ارزیابی</Text>
            </View>
          </PressableScale>
        </Card>
      )}

      {/* Gateways */}
      <Text style={[styles.section, { marginTop: spacing.xl }]}>بخش‌های شفابخش</Text>
      <View style={styles.gridRow}>
        <Gateway
          title="تمرین‌ها"
          desc="کتابخانه تمرین‌های شفابخش"
          tint={gradients.violet}
          icon={<WindIcon size={22} color={colors.white} />}
          onPress={() => switchTab('exercises')}
        />
        <Gateway
          title="دفترچه احساسات"
          desc="نوشتن و پایش احساسات"
          tint={gradients.amber}
          icon={<BookIcon size={22} color={colors.white} />}
          onPress={() => switchTab('journal')}
        />
      </View>
      <View style={styles.gridRow}>
        <Gateway
          title="حال من"
          desc="ثبت حال امروز"
          tint={gradients.pink}
          icon={<ActivityIcon size={22} color={colors.white} />}
          onPress={() => switchTab('mood')}
        />
        <Gateway
          title="راهنمای آرامینا"
          desc="مسیر بهبودی گام‌به‌گام"
          tint={gradients.teal}
          icon={<TargetIcon size={22} color={colors.white} />}
          onPress={() => push('guide')}
        />
      </View>

      {/* Quote */}
      <FadeIn delay={220}>
        <Gradient colors={gradients.brand} angle={135} style={styles.quote}>
          <QuoteIcon size={30} color="rgba(255,255,255,0.5)" />
          <Text style={styles.quoteText}>«{QUOTES[quoteIdx].text}»</Text>
          <Text style={styles.quoteBy}>— {QUOTES[quoteIdx].by}</Text>
          <PressableScale
            onPress={() => setQuoteIdx(i => (i + 1) % QUOTES.length)}
            scaleTo={0.95}>
            <View style={styles.quoteBtn}>
              <RefreshIcon size={16} color={colors.white} />
              <Text style={styles.quoteBtnText}>جمله بعدی</Text>
            </View>
          </PressableScale>
        </Gradient>
      </FadeIn>
    </Screen>
  );
};

const Stat: React.FC<{ value: string; label: string; flame?: boolean }> = ({
  value,
  label,
  flame,
}) => (
  <View style={styles.stat}>
    <View style={styles.statValueRow}>
      <Text style={styles.statValue}>{value}</Text>
      {flame ? <FlameIcon size={16} color={colors.accent} /> : null}
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Gateway: React.FC<{
  title: string;
  desc: string;
  tint: readonly [string, string];
  icon: React.ReactNode;
  onPress: () => void;
}> = ({ title, desc, tint, icon, onPress }) => (
  <View style={styles.gatewayItem}>
    <PressableScale onPress={onPress}>
      <Card style={styles.gatewayCard}>
        <IconTile colors={tint} size={46}>
          {icon}
        </IconTile>
        <Text style={styles.gatewayTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.gatewayDesc} numberOfLines={2}>
          {desc}
        </Text>
      </Card>
    </PressableScale>
  </View>
);

const FadeIn: React.FC<{ delay?: number; style?: object; children: React.ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, delay, useNativeDriver: true }).start();
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  bell: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { fontFamily: font.family, fontSize: 10, color: colors.white },
  hi: { fontSize: 19,  color: colors.text, ...rtlText },
  sub: { fontSize: 14, color: colors.textMuted,  marginTop: 2, ...rtlText },
  hero: { borderRadius: radius.lg, padding: spacing.xl, overflow: 'hidden', ...shadow.floating },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 12,  ...rtlText },
  heroTitle: { color: colors.white, fontSize: 22,  marginVertical: 8, lineHeight: 32, ...rtlText },
  heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13.5, marginBottom: spacing.lg, ...rtlText },
  heroBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  heroBtnText: { color: colors.white, fontSize: 14.5,  ...rtlText },
  statsCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValueRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  statValue: { fontFamily: font.family, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: font.family, fontSize: 11, color: colors.textMuted, marginTop: 3 },
  statDivider: { width: 1, height: 34, backgroundColor: colors.border },
  sectionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  section: { fontSize: 16,  color: colors.text, ...rtlText },
  sectionLink: { fontFamily: font.family, fontSize: 12.5, color: colors.primary },
  exRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  exStart: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exStartText: { fontFamily: font.family, color: colors.white, fontSize: 12 },
  exTitle: { fontSize: 15.5,  color: colors.text, ...rtlText },
  exMeta: { fontSize: 12, color: colors.textMuted,  marginTop: 3, ...rtlText },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyTitle: { fontSize: 16,  color: colors.text, marginTop: spacing.sm, ...rtlText },
  emptyText: { fontFamily: font.family, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 22, writingDirection: 'rtl' },
  emptyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  emptyBtnText: { color: colors.white, fontSize: 14,  ...rtlText },
  gridRow: { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.md },
  gatewayItem: { flex: 1 },
  gatewayCard: { height: 150, gap: spacing.sm, justifyContent: 'flex-start' },
  gatewayTitle: { fontSize: 15,  color: colors.text, marginTop: spacing.sm, ...rtlText },
  gatewayDesc: { fontSize: 12, color: colors.textMuted,  ...rtlText },
  quote: { borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.xl, gap: spacing.sm, overflow: 'hidden', ...shadow.floating },
  quoteText: { color: colors.white, fontSize: 16,  lineHeight: 28, ...rtlText },
  quoteBy: { color: 'rgba(255,255,255,0.85)', fontSize: 13,  ...rtlText },
  quoteBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  quoteBtnText: { fontFamily: font.family, color: colors.white, fontSize: 12.5 },
});
