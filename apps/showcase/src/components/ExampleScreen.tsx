import { BlurTargetView } from 'expo-blur';
import { useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ProgressiveBlur } from './ProgressiveBlur';

type ExampleScreenProps = {
  children: ReactNode;
  onBack: () => void;
  progressiveBlurHeader?: boolean;
  title: string;
};

export function ExampleScreen({
  children,
  onBack,
  progressiveBlurHeader = false,
  title,
}: ExampleScreenProps) {
  const insets = useSafeAreaInsets();
  const blurTargetRef = useRef<View>(null);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 28],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const header = (
    <View
      style={[
        styles.header,
        progressiveBlurHeader && {
          height: insets.top + 66,
          paddingTop: insets.top,
        },
      ]}
    >
      <Pressable
        accessibilityLabel="Back to showcase"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Text accessibilityElementsHidden style={styles.backIcon}>
          ←
        </Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const scrollView = (
    <Animated.ScrollView
      contentContainerStyle={[
        styles.content,
        progressiveBlurHeader && styles.contentWithOverlayHeader,
      ]}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.preview}>{children}</View>
    </Animated.ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {progressiveBlurHeader ? (
        <BlurTargetView ref={blurTargetRef} style={styles.scrollTarget}>
          {scrollView}
        </BlurTargetView>
      ) : (
        <>
          {header}
          {scrollView}
        </>
      )}

      {progressiveBlurHeader ? (
        <View
          pointerEvents="box-none"
          style={[styles.overlayHeader, { height: insets.top + 104 }]}
          testID="progressive-blur-header"
        >
          <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
            <ProgressiveBlur
              blurTarget={blurTargetRef}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {header}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F2F0EA',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 2,
  },
  overlayHeader: {
    height: 104,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DAD7CE',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    transform: [{ scale: 1 }],
    width: 48,
  },
  backButtonPressed: {
    backgroundColor: '#E7E4DC',
    transform: [{ scale: 0.96 }],
  },
  backIcon: {
    color: '#1D1D1B',
    fontSize: 24,
    lineHeight: 27,
  },
  title: {
    color: '#66645E',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  contentWithOverlayHeader: {
    paddingBottom: 96,
    paddingTop: 86,
  },
  scrollTarget: {
    flex: 1,
  },
  preview: {
    alignSelf: 'center',
    maxWidth: 420,
    width: '100%',
  },
});
