/**
 * Home tab — a warm greeting, a "today" highlight card, and a grid of feature
 * shortcuts. Cards stagger-fade in on mount and push a detail page on tap.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Screen } from '../components/Screen';
import { Card, IconTile, PressableScale } from '../components/ui';
import { Gradient } from '../components/Gradient';
import { features, Feature } from '../data/content';
import {
  ActivityIcon,
  BellIcon,
  BookIcon,
  CompassIcon,
  ShieldIcon,
  SparklesIcon,
  WindIcon,
} from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

const iconFor = (key: Feature['icon'], color: string) => {
  const p = { size: 26, color };
  switch (key) {
    case 'wind':
      return <WindIcon {...p} />;
    case 'sparkles':
      return <SparklesIcon {...p} />;
    case 'activity':
      return <ActivityIcon {...p} />;
    case 'book':
      return <BookIcon {...p} />;
    case 'shield':
      return <ShieldIcon {...p} />;
    case 'compass':
      return <CompassIcon {...p} />;
  }
};

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();

  return (
    <Screen padForTabBar contentStyle={{ paddingTop: insets.top + spacing.md }}>
      {/* Greeting row */}
      <View style={styles.topRow}>
        <View style={styles.bell}>
          <BellIcon size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hi}>سلام، همراه عزیز 🌿</Text>
          <Text style={styles.sub}>امروز حالت چطوره؟</Text>
        </View>
      </View>

      {/* Today highlight */}
      <FadeIn delay={80}>
        <Gradient colors={gradients.violet} angle={130} style={styles.today}>
          <View style={styles.todayText}>
            <Text style={styles.todayKicker}>تمرین امروز</Text>
            <Text style={styles.todayTitle}>تنفس ۴-۷-۸ برای آرامش</Text>
            <Text style={styles.todayDesc}>۵ دقیقه با خودت مهربان باش</Text>
          </View>
          <PressableScale onPress={() => push('detail', { key: 'breathing' })}>
            <View style={styles.todayBtn}>
              <WindIcon size={26} color={colors.white} />
            </View>
          </PressableScale>
        </Gradient>
      </FadeIn>

      <Text style={styles.section}>دسترسی سریع</Text>

      <View style={styles.grid}>
        {features.map((f, i) => (
          <FadeIn key={f.key} delay={140 + i * 60} style={styles.gridItem}>
            <PressableScale onPress={() => push('detail', { key: f.key })}>
              <Card style={styles.featureCard}>
                <IconTile colors={f.tint}>{iconFor(f.icon, colors.white)}</IconTile>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.subtitle}</Text>
              </Card>
            </PressableScale>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
};

/** Fade + rise in on mount, staggered by `delay`. */
const FadeIn: React.FC<{
  delay?: number;
  style?: object;
  children: React.ReactNode;
}> = ({ delay = 0, style, children }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  hi: { fontSize: 20, fontWeight: font.black, color: colors.text, ...rtlText },
  sub: { fontSize: 14, color: colors.textMuted, fontWeight: font.medium, ...rtlText, marginTop: 2 },
  today: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadow.floating,
  },
  todayText: { flex: 1 },
  todayKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: font.bold,
    ...rtlText,
  },
  todayTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: font.black,
    marginVertical: 4,
    ...rtlText,
  },
  todayDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, ...rtlText },
  todayBtn: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  section: {
    fontSize: 16,
    fontWeight: font.black,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...rtlText,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: { width: '48%', marginBottom: spacing.md },
  featureCard: { minHeight: 138, justifyContent: 'flex-start', gap: spacing.sm },
  featureTitle: {
    fontSize: 16,
    fontWeight: font.black,
    color: colors.text,
    marginTop: spacing.sm,
    ...rtlText,
  },
  featureSub: { fontSize: 12.5, color: colors.textMuted, fontWeight: font.medium, ...rtlText },
});
