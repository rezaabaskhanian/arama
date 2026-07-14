/**
 * Branded launch splash: the butterfly mark springs in, the wordmark fades up,
 * then it auto-advances to onboarding. Pure Animated + useNativeDriver.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { Gradient } from '../components/Gradient';
import { ButterflyIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

export const SplashScreen: React.FC = () => {
  const { finishSplash } = useNavigation();
  const scale = useRef(new Animated.Value(0.4)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textShift = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 6,
          bounciness: 10,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textShift, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const t = setTimeout(finishSplash, 1900);
    return () => clearTimeout(t);
  }, [finishSplash, rotate, scale, textOpacity, textShift]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '0deg'],
  });

  return (
    <Gradient colors={['#7C3AED', '#4C1D95']} angle={135} style={styles.fill}>
      <View style={styles.center}>
        <Animated.View
          style={[styles.logo, { transform: [{ scale }, { rotate: spin }] }]}>
          <ButterflyIcon size={64} color={colors.white} />
        </Animated.View>
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textShift }] }}>
          <Text style={styles.brand}>آرامینا</Text>
          <Text style={styles.tagline}>همراه آرامش تو</Text>
        </Animated.View>
      </View>
    </Gradient>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  logo: {
    width: 116,
    height: 116,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: font.family,
    color: colors.white,
    fontSize: 34,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  tagline: {
    fontFamily: font.family,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
});
