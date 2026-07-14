/**
 * A soft, branded top banner shown when a push arrives while the app is in the
 * foreground (replaces the plain system Alert). Slides down, auto-dismisses,
 * and taps through to the messages inbox. Mounted once inside the app shell.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, radius, rtlText, shadow, spacing } from '../theme';
import { Gradient } from './Gradient';
import { BellIcon } from '../icons';
import { BannerPayload, setBannerListener } from '../lib/banner';
import { useNavigation } from '../navigation/NavigationContext';

const HIDDEN = -220;

export const InAppBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { push } = useNavigation();
  const [data, setData] = useState<BannerPayload | null>(null);
  const y = useRef(new Animated.Value(HIDDEN)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBannerListener(p => setData(p));
    return () => setBannerListener(null);
  }, []);

  const dismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(y, { toValue: HIDDEN, duration: 240, useNativeDriver: true }).start(() =>
      setData(null),
    );
  };

  useEffect(() => {
    if (!data) return;
    y.setValue(HIDDEN);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 8, speed: 13 }).start();
    timer.current = setTimeout(dismiss, 4500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingTop: insets.top + 6, transform: [{ translateY: y }] }]}>
      <Pressable
        onPress={() => {
          dismiss();
          push('messages');
        }}>
        <Gradient colors={gradients.violet} angle={130} style={styles.card}>
          <View style={styles.icon}>
            <BellIcon size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {data.title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {data.body}
            </Text>
          </View>
        </Gradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 50,
  },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
    ...shadow.floating,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, color: colors.white, ...rtlText },
  body: { fontSize: 12.5, color: 'rgba(255,255,255,0.92)', marginTop: 2, ...rtlText },
});
