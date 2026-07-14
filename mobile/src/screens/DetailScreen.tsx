/**
 * Generic inner page reached from any tab. Shows a themed hero for the chosen
 * feature plus placeholder content — its real job here is to demonstrate the
 * smooth push transition and the RTL back button in the header.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen, Header } from '../components/Screen';
import { GradientButton } from '../components/ui';
import { Gradient } from '../components/Gradient';
import {
  ActivityIcon,
  BellIcon,
  BookIcon,
  CompassIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
  WindIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

type Info = {
  title: string;
  tint: readonly [string, string];
  icon: React.ReactNode;
  body: string;
  cta: string;
};

const white = colors.white;

const catalog: Record<string, Info> = {
  breathing: {
    title: 'تنفس آرام',
    tint: gradients.sky,
    icon: <WindIcon size={30} color={white} />,
    body: 'با ریتم ۴-۷-۸ نفس بکش: چهار شماره دم، هفت شماره نگه‌داشتن و هشت شماره بازدم. این تمرین سیستم عصبی را آرام می‌کند و به بازگشت حس امنیت کمک می‌کند.',
    cta: 'شروع تمرین',
  },
  exercises: {
    title: 'تمرین‌ها',
    tint: gradients.violet,
    icon: <SparklesIcon size={30} color={white} />,
    body: 'تمرین‌های کوتاه و هدایت‌شده که قدم‌به‌قدم همراهت هستند. بدون عجله، با مهربانی و در ریتم خودت پیش برو.',
    cta: 'ادامه',
  },
  mood: {
    title: 'حال من',
    tint: gradients.pink,
    icon: <ActivityIcon size={30} color={white} />,
    body: 'ثبت روزانه‌ی حال دل کمک می‌کند الگوها را ببینی و به خودت نزدیک‌تر شوی. هیچ پاسخ درست یا غلطی وجود ندارد.',
    cta: 'ثبت حال',
  },
  journal: {
    title: 'ژورنال',
    tint: gradients.amber,
    icon: <BookIcon size={30} color={white} />,
    body: 'اینجا فضایی خصوصی برای نوشتن افکار و احساسات توست. نوشتن به پردازش تجربه‌ها و رها کردن سنگینی‌ها کمک می‌کند.',
    cta: 'نوشتن',
  },
  guide: {
    title: 'راهنما',
    tint: gradients.teal,
    icon: <CompassIcon size={30} color={white} />,
    body: 'درباره‌ی تروما، واکنش‌های طبیعی بدن و ذهن، و مسیرهای بهبودی بیشتر بدان. آگاهی، اولین قدم آرامش است.',
    cta: 'مطالعه',
  },
  supervision: {
    title: 'همراهی امن',
    tint: gradients.violet,
    icon: <ShieldIcon size={30} color={white} />,
    body: 'در صورت تمایل می‌توانی با یک متخصص در ارتباط باشی و مسیرت را با همراهی امن ادامه دهی.',
    cta: 'درخواست ارتباط',
  },
  notifications: {
    title: 'یادآوری‌های مهربان',
    tint: gradients.sky,
    icon: <BellIcon size={30} color={white} />,
    body: 'یادآوری‌های ملایم تا تمرین‌ها و لحظه‌های آرامش را فراموش نکنی. زمان‌بندی کاملاً در اختیار توست.',
    cta: 'تنظیم یادآوری',
  },
  logout: {
    title: 'خروج از حساب',
    tint: gradients.pink,
    icon: <UserIcon size={30} color={white} />,
    body: 'آیا می‌خواهی از حساب کاربری خارج شوی؟ هر زمان که بخواهی می‌توانی دوباره برگردی.',
    cta: 'خروج',
  },
};

const fallback: Info = {
  title: 'جزئیات',
  tint: gradients.violet,
  icon: <SparklesIcon size={30} color={white} />,
  body: 'این بخش به‌زودی کامل می‌شود.',
  cta: 'باشه',
};

export const DetailScreen: React.FC<{ params?: Record<string, unknown> }> = ({ params }) => {
  const { pop } = useNavigation();
  const key = (params?.key as string) || '';
  const info = catalog[key] ?? fallback;
  const title = (params?.title as string) || info.title;

  return (
    <View style={styles.fill}>
      <Header title={title} onBack={pop} />
      <Screen contentStyle={{ paddingTop: 0 }}>
        <Gradient colors={info.tint} angle={130} style={styles.hero}>
          <View style={styles.heroIcon}>{info.icon}</View>
          <Text style={styles.heroTitle}>{info.title}</Text>
        </Gradient>

        <Text style={styles.body}>{info.body}</Text>

        <View style={styles.tips}>
          <Text style={styles.tip}>• با آرامش و بدون قضاوت شروع کن</Text>
          <Text style={styles.tip}>• اگر خسته شدی، مکث کن</Text>
          <Text style={styles.tip}>• هر قدم کوچک، ارزشمند است</Text>
        </View>

        <GradientButton label={info.cta} colors={info.tint} onPress={pop} style={{ marginTop: spacing.xl }} />
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
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
  heroTitle: { fontSize: 22,  color: colors.white, ...rtlText },
  body: {
    fontSize: 15.5,
    lineHeight: 30,
    color: colors.textMuted,
    
    marginTop: spacing.xl,
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
});
