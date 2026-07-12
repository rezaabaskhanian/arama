/**
 * Small library of reusable, on-brand UI primitives used across screens:
 * PressableScale (soft press feedback), Card, GradientButton, IconTile, Screen.
 * Kept in one file so screens import from a single place.
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, radius, rtlText, shadow, spacing } from '../theme';
import { Gradient } from './Gradient';

/** Wraps children with a gentle spring scale-down on press — the app's core "soft" feel. */
export const PressableScale: React.FC<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number;
}> = ({ onPress, style, children, scaleTo = 0.96 }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const to = (v: number) =>
    Animated.spring(scale, {
      toValue: v,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const Card: React.FC<{
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const GradientButton: React.FC<{
  label: string;
  onPress?: () => void;
  colors?: readonly [string, string];
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, colors: c = ['#8B5CF6', '#6D28D9'], icon, style }) => (
  <PressableScale onPress={onPress} style={style} scaleTo={0.97}>
    <Gradient colors={c} style={styles.btn}>
      <View style={styles.btnRow}>
        {icon}
        <Text style={styles.btnLabel}>{label}</Text>
      </View>
    </Gradient>
  </PressableScale>
);

/** A rounded gradient tile holding an icon — used for feature cards. */
export const IconTile: React.FC<{
  colors: readonly [string, string];
  children: React.ReactNode;
  size?: number;
}> = ({ colors: c, children, size = 52 }) => (
  <Gradient
    colors={c}
    style={[
      styles.iconTile,
      { width: size, height: size, borderRadius: size / 3 },
    ]}>
    {children}
  </Gradient>
);

export const Title: React.FC<{ children: React.ReactNode; style?: StyleProp<TextStyle> }> = ({
  children,
  style,
}) => <Text style={[styles.title, style]}>{children}</Text>;

export const Body: React.FC<{ children: React.ReactNode; style?: StyleProp<TextStyle> }> = ({
  children,
  style,
}) => <Text style={[styles.body, style]}>{children}</Text>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.floating,
  },
  btnRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnLabel: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: font.black,
    ...rtlText,
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: font.black,
    ...rtlText,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: font.medium,
    ...rtlText,
  },
});
