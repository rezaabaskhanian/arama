/**
 * Switches the top-level phases with a soft cross-fade:
 *   splash → onboarding → (auth if signed-out) → app
 * The auth gate is driven by AuthContext: once a session exists we show the
 * tabbed app; otherwise the login/register flow.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Phase, useNavigation } from './NavigationContext';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { AppShell } from './AppShell';

export const RootNavigator: React.FC = () => {
  const { phase } = useNavigation();
  const { user } = useAuth();
  const fade = useRef(new Animated.Value(1)).current;

  // The current "route" — used to re-trigger the cross-fade on change.
  const route: string = phase !== 'app' ? phase : user ? 'app' : 'auth';

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [route, fade]);

  return (
    <Animated.View style={[styles.fill, { opacity: fade }]}>
      {render(phase, !!user)}
    </Animated.View>
  );
};

const render = (phase: Phase, authed: boolean) => {
  switch (phase) {
    case 'splash':
      return <SplashScreen />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'app':
      return authed ? <AppShell /> : <AuthNavigator />;
  }
};

const styles = StyleSheet.create({ fill: { flex: 1 } });
