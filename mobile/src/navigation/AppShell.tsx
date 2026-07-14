/**
 * The main app once onboarding is done: a tab host (soft cross-fade between
 * tabs) with the floating TabBar, and an overlay stack for pushed pages.
 *
 * Stack transitions are RTL-correct: a pushed page slides in FROM THE LEFT and
 * slides back out to the left on pop, matching the right-pointing back button.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { TabBar } from './TabBar';
import { StackEntry, TabKey, useNavigation } from './NavigationContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { MoodScreen } from '../screens/MoodScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { GuideScreen } from '../screens/GuideScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AssessmentScreen } from '../screens/AssessmentScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { InAppBanner } from '../components/InAppBanner';

const { width } = Dimensions.get('window');

const tabScreens: Record<TabKey, React.FC> = {
  home: HomeScreen,
  exercises: ExercisesScreen,
  journal: JournalScreen,
  mood: MoodScreen,
  progress: ProgressScreen,
};

/** Route a pushed stack entry to its screen by name. */
const renderStackScreen = (entry: StackEntry): React.ReactNode => {
  switch (entry.name) {
    case 'exercise':
      return <ExerciseDetailScreen params={entry.params} />;
    case 'profile':
      return <ProfileScreen />;
    case 'guide':
      return <GuideScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'assessment':
      return <AssessmentScreen />;
    case 'messages':
      return <MessagesScreen />;
    default:
      return <DetailScreen params={entry.params} />;
  }
};

export const AppShell: React.FC = () => {
  const { tab, stack } = useNavigation();

  return (
    <View style={styles.fill}>
      <TabHost tab={tab} />
      <StackHost stack={stack} />
      <TabBar />
      <InAppBanner />
    </View>
  );
};

/** Renders the active tab, fading/rising in whenever the tab changes. */
const TabHost: React.FC<{ tab: TabKey }> = ({ tab }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const Screen = tabScreens[tab];

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [tab, anim]);

  return (
    <Animated.View
      style={[
        styles.fill,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}>
      <Screen />
    </Animated.View>
  );
};

/**
 * Keeps its own copy of the stack so a popped page can finish its exit
 * animation before it unmounts.
 */
const StackHost: React.FC<{ stack: StackEntry[] }> = ({ stack }) => {
  const [rendered, setRendered] = useState<StackEntry[]>(stack);
  const [closingId, setClosingId] = useState<number | null>(null);

  useEffect(() => {
    if (stack.length >= rendered.length) {
      setRendered(stack);
      setClosingId(null);
    } else {
      // a page was popped — mark the removed top as closing, keep rendering it
      const removed = rendered[rendered.length - 1];
      setClosingId(removed?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack]);

  const onClosed = () => {
    setRendered(stack);
    setClosingId(null);
  };

  return (
    <>
      {rendered.map((entry, i) => (
        <StackPage
          key={entry.id}
          entry={entry}
          closing={entry.id === closingId}
          onClosed={onClosed}
          elevation={i + 1}
        />
      ))}
    </>
  );
};

const StackPage: React.FC<{
  entry: StackEntry;
  closing: boolean;
  onClosed: () => void;
  elevation: number;
}> = ({ entry, closing, onClosed, elevation }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  useEffect(() => {
    if (closing) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => finished && onClosed());
    }
  }, [closing, anim, onClosed]);

  // RTL: enter from the left (negative X) and rest at 0.
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.page,
        { zIndex: elevation, transform: [{ translateX }] },
      ]}>
      {renderStackScreen(entry)}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  page: { backgroundColor: colors.background },
});
