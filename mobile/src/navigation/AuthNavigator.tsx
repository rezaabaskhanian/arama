/**
 * Signed-out flow: a soft cross-fade between the Login and Register screens.
 * Kept separate from the main stack so it can own its own tiny transition.
 */
import React, { useState } from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

export const AuthNavigator: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return mode === 'login' ? (
    <LoginScreen onSwitch={() => setMode('register')} />
  ) : (
    <RegisterScreen onSwitch={() => setMode('login')} />
  );
};
