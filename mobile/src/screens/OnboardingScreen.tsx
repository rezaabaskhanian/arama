/**
 * Three-slide intro carousel. Each slide has a calming background photo, a dark
 * overlay for legibility, an emoji badge, a title and an app description.
 * Horizontal paging + animated dots; last slide reveals a "start" button.
 * RTL-aware: slides are laid out right-to-left so swiping feels natural in Persian.
 */
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, rtlText, spacing } from '../theme';
import { slides } from '../data/content';
import { GradientButton, PressableScale } from '../components/ui';
import { ChevronLeftIcon } from '../icons';
import { useNavigation } from '../navigation/NavigationContext';

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const { finishOnboarding } = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  // RTL: reverse the visual order so page 0 is the right-most slide.
  const ordered = [...slides].reverse();
  const lastVisualIndex = ordered.length - 1;

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    // convert visual page back to logical slide index
    setIndex(lastVisualIndex - page);
  };

  const goNext = () => {
    const nextLogical = index + 1;
    if (nextLogical >= slides.length) {
      finishOnboarding();
      return;
    }
    const visualPage = lastVisualIndex - nextLogical;
    scrollRef.current?.scrollTo({ x: visualPage * width, animated: true });
    setIndex(nextLogical);
  };

  const isLast = index === slides.length - 1;

  return (
    <View style={styles.fill}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // start on the right-most page (logical slide 0)
        contentOffset={{ x: lastVisualIndex * width, y: 0 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}>
        {ordered.map(slide => (
          <ImageBackground
            key={slide.key}
            source={{ uri: slide.image }}
            style={[styles.slide, { width }]}
            resizeMode="cover">
            <View style={styles.overlay} />
            <View
              style={[
                styles.slideContent,
                { paddingTop: insets.top + spacing.xxl, paddingBottom: 220 },
              ]}>
              <View style={styles.emojiBadge}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.desc}>{slide.description}</Text>
            </View>
          </ImageBackground>
        ))}
      </Animated.ScrollView>

      {/* Fixed controls overlaying the pager */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Dots count={slides.length} index={index} />
        <GradientButton
          label={isLast ? 'شروع کنیم' : 'بعدی'}
          onPress={goNext}
          colors={slides[index].tint}
          icon={!isLast ? <ChevronLeftIcon size={20} color={colors.white} /> : undefined}
          style={styles.cta}
        />
        {!isLast && (
          <PressableScale onPress={finishOnboarding} scaleTo={0.94}>
            <Text style={styles.skip}>رد کردن</Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
};

const Dots: React.FC<{ count: number; index: number }> = ({ count, index }) => (
  <View style={styles.dots}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.text },
  slide: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,10,30,0.5)',
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'flex-end',
  },
  emojiBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 34 },
  title: {
    color: colors.white,
    fontSize: 28,
    
    marginBottom: spacing.md,
    ...rtlText,
  },
  desc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 30,
    
    ...rtlText,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row-reverse',
    alignSelf: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  dot: { height: 8, borderRadius: radius.pill },
  dotActive: { width: 26, backgroundColor: colors.white },
  dotIdle: { width: 8, backgroundColor: 'rgba(255,255,255,0.45)' },
  cta: { width: '100%' },
  skip: {
    fontFamily: font.family,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
});
