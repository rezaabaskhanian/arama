/**
 * Screen shell + RTL Header.
 * Header places the back affordance on the RIGHT and uses a right-pointing
 * chevron — the correct "back" direction for a Persian (RTL) reader.
 */
import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import { ChevronRightIcon } from '../icons';
import { PressableScale } from './ui';

export const Header: React.FC<{
  title: string;
  onBack?: () => void;
}> = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      {/* row-reverse => title sits on the right, back button on the far right edge */}
      <View style={styles.headerRow}>
        {onBack ? (
          <PressableScale onPress={onBack} scaleTo={0.9}>
            <View style={styles.backBtn}>
              <ChevronRightIcon size={22} color={colors.text} />
            </View>
          </PressableScale>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.backBtn} />
      </View>
    </View>
  );
};

export const Screen: React.FC<{
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** extra bottom padding so content clears the floating tab bar */
  padForTabBar?: boolean;
}> = ({ children, scroll = true, contentStyle, padForTabBar }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = (padForTabBar ? 110 : spacing.xl) + insets.bottom;

  if (!scroll) {
    return <View style={[styles.flex, contentStyle]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { padding: spacing.lg, paddingBottom: bottomPad },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: font.black,
    writingDirection: 'rtl',
  },
});
