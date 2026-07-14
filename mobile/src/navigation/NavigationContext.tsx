/**
 * Tiny hand-rolled navigator — no react-navigation, so it needs no native
 * linking and gives us full control over the soft RTL transitions the design
 * calls for. It models three things:
 *   - phase:  splash → onboarding → app
 *   - tab:    which bottom-tab screen is active
 *   - stack:  pages pushed on top of the tabs (each renders a back button)
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TabKey = 'exercises' | 'journal' | 'home' | 'mood' | 'progress';
export type Phase = 'splash' | 'onboarding' | 'app';

export type StackEntry = { id: number; name: string; params?: Record<string, unknown> };

type NavState = {
  phase: Phase;
  tab: TabKey;
  stack: StackEntry[];
  finishSplash: () => void;
  finishOnboarding: () => void;
  switchTab: (tab: TabKey) => void;
  push: (name: string, params?: Record<string, unknown>) => void;
  pop: () => void;
};

const NavContext = createContext<NavState | null>(null);

let nextId = 1;

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<Phase>('splash');
  const [tab, setTab] = useState<TabKey>('home');
  const [stack, setStack] = useState<StackEntry[]>([]);

  const finishSplash = useCallback(() => setPhase('onboarding'), []);
  const finishOnboarding = useCallback(() => setPhase('app'), []);

  const switchTab = useCallback((next: TabKey) => {
    setStack([]); // leaving to a root tab clears any pushed pages
    setTab(next);
  }, []);

  const push = useCallback(
    (name: string, params?: Record<string, unknown>) =>
      setStack(s => [...s, { id: nextId++, name, params }]),
    [],
  );

  const pop = useCallback(() => setStack(s => s.slice(0, -1)), []);

  const value = useMemo<NavState>(
    () => ({ phase, tab, stack, finishSplash, finishOnboarding, switchTab, push, pop }),
    [phase, tab, stack, finishSplash, finishOnboarding, switchTab, push, pop],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};

export const useNavigation = (): NavState => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
};
