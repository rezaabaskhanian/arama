/**
 * Switches the three top-level phases with a soft cross-fade:
 *   splash → onboarding → app
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Phase, useNavigation } from './NavigationContext';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppShell } from './AppShell';

export const RootNavigator: React.FC = () => {
  const { phase } = useNavigation();
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [phase, fade]);

  return (
    <Animated.View style={[styles.fill, { opacity: fade }]}>
      {render(phase)}
    </Animated.View>
  );
};

const render = (phase: Phase) => {
  switch (phase) {
    case 'splash':
      return <SplashScreen />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'app':
      return <AppShell />;
  }
};

const styles = StyleSheet.create({ fill: { flex: 1 } });
