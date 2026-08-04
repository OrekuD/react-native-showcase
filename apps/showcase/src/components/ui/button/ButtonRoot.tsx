import { forwardRef, useCallback, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Pressable, type GestureResponderEvent, type View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { resolveButtonState } from "./buttonState";
import { resolveButtonTokens } from "./buttonTheme";
import { useButtonTheme } from "./ButtonThemeProvider";
import {
  ButtonContext,
  EASE_OUT,
  PRESS_IN_DURATION_MS,
  PRESS_OUT_DURATION_MS,
  PRESSED_SCALE,
  styles,
  type ButtonProps,
} from "./buttonShared";

const AnimatedSquircleView = Animated.createAnimatedComponent(FastSquircleView);

export const ButtonRoot = forwardRef<View, ButtonProps>(function ButtonRoot(
  {
    accessibilityLabel,
    accessibilityRole = "button",
    accessibilityState,
    children,
    disabled = false,
    haptics = false,
    loading = false,
    onPress,
    onPressIn,
    onPressOut,
    size = "md",
    style: pressableStyle,
    theme,
    variant = "primary",
    ...props
  },
  ref
) {
  const pressedScale = useSharedValue(1);
  const inheritedTheme = useButtonTheme();
  const { accessibilityState: resolvedAccessibilityState, isDisabled } =
    resolveButtonState({ accessibilityState, disabled, loading });
  const tokens = useMemo(
    () => resolveButtonTokens(inheritedTheme, variant, size, theme),
    [inheritedTheme, size, theme, variant]
  );
  const color = tokens.appearance.foregroundColor;
  const iconSize = tokens.size.iconSize;
  const contextValue = useMemo(
    () => ({ color, label: tokens.label, loading, size: iconSize }),
    [color, iconSize, loading, tokens.label]
  );
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
  }));
  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      pressedScale.value = withTiming(PRESSED_SCALE, {
        duration: PRESS_IN_DURATION_MS,
        easing: EASE_OUT,
        reduceMotion: ReduceMotion.System,
      });
      onPressIn?.(event);
    },
    [onPressIn, pressedScale]
  );
  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      pressedScale.value = withTiming(1, {
        duration: PRESS_OUT_DURATION_MS,
        easing: EASE_OUT,
        reduceMotion: ReduceMotion.System,
      });
      onPressOut?.(event);
    },
    [onPressOut, pressedScale]
  );
  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (haptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      onPress?.(event);
    },
    [haptics, onPress]
  );

  return (
    <ButtonContext.Provider value={contextValue}>
      <AnimatedSquircleView
        cornerSmoothing={tokens.cornerSmoothing}
        style={[
          styles.frame,
          {
            backgroundColor: tokens.appearance.backgroundColor,
            borderColor: tokens.appearance.borderColor,
            borderWidth: tokens.appearance.borderWidth,
          },
          size === "icon" && {
            alignSelf: "auto",
            height: tokens.size.height,
            width: tokens.size.height,
          },
          disabled && styles.disabled,
          animatedPressStyle,
        ]}
      >
        <Pressable
          {...props}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole}
          accessibilityState={resolvedAccessibilityState}
          disabled={isDisabled}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          ref={ref}
          style={(state) => [
            styles.root,
            {
              minHeight: tokens.size.height,
              paddingHorizontal: tokens.size.paddingHorizontal,
            },
            size === "icon" && {
              height: tokens.size.height,
              width: tokens.size.height,
            },
            typeof pressableStyle === "function"
              ? pressableStyle(state)
              : pressableStyle,
          ]}
        >
          {children}
        </Pressable>
      </AnimatedSquircleView>
    </ButtonContext.Provider>
  );
});
