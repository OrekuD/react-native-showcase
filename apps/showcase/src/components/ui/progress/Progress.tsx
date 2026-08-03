import { useEffect, useMemo } from "react";
import {
  StyleSheet,
  type DimensionValue,
  type ViewProps,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { resolveProgressValue } from "./progressState";
import {
  resolveProgressTokens,
  type ProgressThemeOverride,
} from "./progressTheme";
import { useProgressTheme } from "./ProgressThemeProvider";

/** Props accepted by {@link Progress}. */
export type ProgressProps = Omit<ViewProps, "children"> & {
  /** Enables a timing transition when `value` changes. @default true */
  animated?: boolean;
  /** Fill color. Overrides the closest progress theme. */
  color?: string;
  /** Transition duration in milliseconds. @default 280 */
  durationMs?: number;
  /** Track height in density-independent pixels. @default 10 */
  height?: number;
  /** Largest meaningful value. @default 100 */
  max?: number;
  /** Partial tokens that affect this progress bar only. */
  theme?: ProgressThemeOverride;
  /** Fill color behind the indicator. Overrides the closest progress theme. */
  trackColor?: string;
  /** Current completed value. @default 0 */
  value?: number;
  /** Track width. @default '100%' */
  width?: DimensionValue;
};

/**
 * An animated horizontal progress bar.
 *
 * @example
 * <Progress value={72} color="#6558D9" />
 */
export function Progress({
  animated = true,
  color,
  durationMs = 280,
  height = 10,
  max = 100,
  style,
  theme: themeOverride,
  trackColor,
  value = 0,
  width = "100%",
  ...viewProps
}: ProgressProps) {
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError("Progress height must be a positive finite number.");
  }
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError(
      "Progress durationMs must be a finite number greater than or equal to 0.",
    );
  }

  const inheritedTheme = useProgressTheme();
  const theme = useMemo(
    () => resolveProgressTokens(inheritedTheme, themeOverride),
    [inheritedTheme, themeOverride],
  );
  const resolvedValue = resolveProgressValue(value, max);
  const progress = useSharedValue(resolvedValue);
  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    progress.value = animated
      ? withTiming(resolvedValue, {
          duration: durationMs,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        })
      : resolvedValue;
  }, [animated, durationMs, progress, resolvedValue]);

  return (
    <FastSquircleView
      {...viewProps}
      cornerSmoothing={theme.cornerSmoothing}
      style={[
        styles.track,
        {
          backgroundColor: trackColor ?? theme.trackColor,
          borderRadius: height / 2,
          height,
          width,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: color ?? theme.indicatorColor,
            borderRadius: height / 2,
            height,
          },
          indicatorStyle,
        ]}
      />
    </FastSquircleView>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
  },
  indicator: {
    left: 0,
    position: "absolute",
    top: 0,
  },
});
