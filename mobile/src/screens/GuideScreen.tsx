/**
 * Guide — mirrors the web `/guide` page: five ordered recovery steps, a
 * "consistency" tip card, and an immediate-help card that opens the breathing
 * exercise. Pushed as a page (RTL back button in the header).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Header, Screen } from '../components/Screen';
import { Card, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  BookIcon,
  ClipboardIcon,
  HeartHandshakeIcon,
  LightbulbIcon,
  ShieldIcon,
  SparklesIcon,
  WindIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

type Step = {
  icon: React.FC<{ size?: number; color?: string }>;
  tint: readonly [string, string];
  badge: string;
  title: string;
  desc: string;
};

const STEPS: Step[] = [
  {
    icon: ClipboardIcon,
    tint: gradients.violet,
    badge: 'قدم ۱',
    title: 'اول، ارزیابی وضعیت را انجام بده',
    desc: 'با یک ارزیابی کوتاه، سطح ترومایت مشخص می‌شود. همه‌ی تمرین‌ها بر اساس همین نتیجه شخصی‌سازی می‌شوند.',
  },
  {
    icon: WindIcon,
    tint: gradients.teal,
    badge: 'قدم ۲',
    title: 'هر روز یک تمرین شفابخش انجام بده',
    desc: 'تمرین‌ها روزانه و مرحله‌به‌مرحله باز می‌شوند — هر روز یک تمرین، تا عادت بسازی و مسیرت پایدار بماند.',
  },
  {
    icon: BookIcon,
    tint: gradients.amber,
    badge: 'قدم ۳',
    title: 'حالت را ثبت کن و بنویس',
    desc: 'هر روز حال‌وهوایت را ثبت کن و در دفترچه بنویس. این کار روند حالت را نشان می‌دهد و مسیرت را روشن‌تر می‌کند.',
  },
  {
    icon: HeartHandshakeIcon,
    tint: gradients.violet,
    badge: 'قدم ۴',
    title: 'اگر خواستی، همراهی روانشناس را روشن کن',
    desc: 'می‌توانی از یک روانشناس بخواهی مسیرت را دنبال کند. اگر تا شب پیامی نگذارد، آرامینا خودش برایت پیام دلگرم‌کننده می‌فرستد.',
  },
  {
    icon: SparklesIcon,
    tint: gradients.pink,
    badge: 'قدم ۵',
    title: 'قدم در دنیای واقعی بردار',
    desc: 'بعد از چند تمرین، «تمرین‌های واقعی زندگی» باز می‌شود: مهربانی، سفر و... . اول کار درونی، بعد قدم در دنیای واقعی.',
  },
];

export const GuideScreen: React.FC = () => {
  const { pop, push } = useNavigation();
  return (
    <View style={styles.fill}>
      <Header title="راهنمای آرامینا" onBack={pop} />
      <Screen contentStyle={{ paddingTop: 0 }}>
        <View style={styles.intro}>
          <Gradient colors={gradients.amber} style={styles.introIcon}>
            <LightbulbIcon size={30} color={colors.white} />
          </Gradient>
          <Text style={styles.introText}>
            برای بهترین نتیجه این مسیر ساده را دنبال کن. بهبودی نتیجه‌ی قدم‌های کوچکِ هرروزه است. 🌱
          </Text>
        </View>

        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} style={styles.step}>
              <View style={styles.stepRow}>
                <Gradient colors={s.tint} style={styles.stepIcon}>
                  <Icon size={26} color={colors.white} />
                </Gradient>
                <View style={{ flex: 1 }}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{s.badge}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Consistency tip */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>راز بهترین نتیجه: تداوم</Text>
          <Text style={styles.tipLine}>• هر روز فقط چند دقیقه وقت بگذار؛ کیفیت مهم‌تر از مدت است.</Text>
          <Text style={styles.tipLine}>• حالت را روزانه ثبت کن تا روندش را ببینی.</Text>
          <Text style={styles.tipLine}>• اگر یک روز را از دست دادی، فردا دوباره ادامه بده — بی‌قضاوت.</Text>
        </Card>

        {/* Immediate help */}
        <PressableScale onPress={() => push('detail', { key: 'breathing' })} scaleTo={0.98}>
          <Gradient colors={gradients.pink} angle={135} style={styles.help}>
            <View style={styles.helpIcon}>
              <ShieldIcon size={26} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>در لحظه‌ی سخت، تنها نیستی</Text>
              <Text style={styles.helpDesc}>
                هر وقت حالت خیلی بد شد، چند نفس عمیق بکش تا بدنت از حالت هشدار خارج شود.
              </Text>
            </View>
          </Gradient>
        </PressableScale>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  intro: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  introIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  introText: { fontFamily: font.family, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 24, ...{ writingDirection: 'rtl' as const } },
  step: { marginBottom: spacing.md },
  stepRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.md },
  stepIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: { fontFamily: font.family, fontSize: 10, color: colors.textMuted },
  stepTitle: { fontSize: 16,  color: colors.text, lineHeight: 24, ...rtlText },
  stepDesc: { fontSize: 13, color: colors.textMuted,  lineHeight: 22, marginTop: 6, ...rtlText },
  tipCard: { marginTop: spacing.sm, marginBottom: spacing.md, gap: spacing.sm },
  tipTitle: { fontSize: 15.5,  color: colors.text, marginBottom: 4, ...rtlText },
  tipLine: { fontSize: 13.5, color: colors.textMuted,  lineHeight: 24, ...rtlText },
  help: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.floating,
  },
  helpIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontSize: 16,  color: colors.white, ...rtlText },
  helpDesc: { fontSize: 13, color: 'rgba(255,255,255,0.92)',  lineHeight: 22, marginTop: 4, ...rtlText },
});
