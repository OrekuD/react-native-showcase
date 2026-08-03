import {
  Canvas,
  Group,
  Path,
  Skia,
  vec,
  type SkPath,
} from "@shopify/react-native-skia";
import { useEffect, useMemo, type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import {
  Easing,
  ReduceMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  resolveCircularProgressArcGeometry,
  resolveCircularProgressSegmentRanges,
  resolveCircularProgressValue,
  type CircularProgressArcLayout,
  type CircularProgressSegmentMode,
} from "./circularProgressState";
import {
  resolveCircularProgressTokens,
  type CircularProgressThemeOverride,
} from "./circularProgressTheme";
import { useCircularProgressTheme } from "./CircularProgressThemeProvider";

/** Stroke end-cap options supported by a circular progress ring. */
export type CircularProgressStrokeCap = "butt" | "round" | "square";

export type { CircularProgressArcLayout };
export type { CircularProgressSegmentMode };

/** Bounds available to function-child content in {@link CircularProgress}. */
export type CircularProgressContentArea = "inner" | "full";

/** Values available to the function child of {@link CircularProgress}. */
export type CircularProgressCenterState = {
  /** The current value, sequential total, or highest cumulative segment value. */
  value: number;
  /** The value at which the indicator is fully complete. */
  max: number;
  /** The current value clamped to the range from 0 to 1. */
  progress: number;
  /** The rounded completion percentage from 0 to 100. */
  percentage: number;
};

/** A stable, colored value rendered as one section of a segmented ring. */
export type CircularProgressSegment = {
  /** Color painted for this segment. */
  readonly color: string;
  /** Stable identifier used to preserve this segment across updates. */
  readonly id: string;
  /** Non-negative amount this segment contributes toward `max`. */
  readonly value: number;
};

type CircularProgressSharedProps = Omit<ViewProps, "children"> & {
  /** Controls whether partial arcs retain square bounds or fit their visible paint. @default 'square' */
  arcLayout?: CircularProgressArcLayout;
  /** Optional centered content that receives the current progress state. */
  children?: (state: CircularProgressCenterState) => ReactNode;
  /**
   * Bounds available to function-child content. `inner` keeps content inside
   * the ring; `full` supplies the component's full square bounds. @default 'inner'
   */
  contentArea?: CircularProgressContentArea;
  /** Enables a timing transition when `value` changes. @default true */
  animated?: boolean;
  /** Transition duration in milliseconds. @default 420 */
  durationMs?: number;
  /** Largest meaningful value. @default 100 */
  max?: number;
  /** Canvas width and height in density-independent pixels. @default 96 */
  size?: number;
  /** Angle where progress begins, in degrees. @default -90 */
  startAngle?: number;
  /** Style applied to the view that owns the Skia canvas. */
  style?: StyleProp<ViewStyle>;
  /** Shape of both stroke endpoints. @default 'round' */
  strokeCap?: CircularProgressStrokeCap;
  /** Partial tokens that affect this ring only. */
  theme?: CircularProgressThemeOverride;
  /** Ring stroke thickness in density-independent pixels. @default 10 */
  thickness?: number;
  /** Track color. Overrides the closest circular progress theme. */
  trackColor?: string;
  /** Clockwise angle covered by the track, from greater than 0 through 360 degrees. @default 360 */
  sweepAngle?: number;
};

type CircularProgressSingleValueProps = {
  /** Indicator color. Overrides the closest circular progress theme. */
  color?: string;
  segmentGapAngle?: never;
  segmentMode?: never;
  segments?: never;
  /** Current completed value. @default 0 */
  value?: number;
};

type CircularProgressSequentialValueProps = {
  color?: never;
  /** Visible angular gap between adjacent segments, in degrees. @default 0 */
  segmentGapAngle?: number;
  /** Places each segment after the previous segment. @default 'sequential' */
  segmentMode?: "sequential";
  /** Ordered colored values rendered sequentially along the same track. */
  segments: readonly CircularProgressSegment[];
  value?: never;
};

type CircularProgressCumulativeValueProps = {
  color?: never;
  segmentGapAngle?: never;
  /** Layers every segment from the same origin, with the highest value behind. */
  segmentMode: "cumulative";
  /** Independent colored progress values measured against the same `max`. */
  segments: readonly CircularProgressSegment[];
  value?: never;
};

/** Props accepted by {@link CircularProgress}. */
export type CircularProgressProps = CircularProgressSharedProps &
  (
    | CircularProgressCumulativeValueProps
    | CircularProgressSequentialValueProps
    | CircularProgressSingleValueProps
  );

// A stroked Skia path is antialiased beyond its mathematical bounds. Keeping
// one logical pixel of paint room prevents iOS from flattening its tangents
// against the Canvas edge, including at six o'clock.
const EDGE_INSET = 1;

type CircularProgressSegmentIndicatorProps = {
  animated: boolean;
  color: string;
  durationMs: number;
  end: number;
  path: SkPath;
  start: number;
  strokeCap: CircularProgressStrokeCap;
  thickness: number;
};

function CircularProgressSegmentIndicator({
  animated,
  color,
  durationMs,
  end,
  path,
  start,
  strokeCap,
  thickness,
}: CircularProgressSegmentIndicatorProps) {
  const animatedStart = useSharedValue(start);
  const animatedEnd = useSharedValue(end);

  useEffect(() => {
    const animationConfig = {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    } as const;

    animatedStart.value = animated
      ? withTiming(start, animationConfig)
      : start;
    animatedEnd.value = animated ? withTiming(end, animationConfig) : end;
  }, [animated, animatedEnd, animatedStart, durationMs, end, start]);

  return (
    <Path
      color={color}
      end={animatedEnd}
      path={path}
      start={animatedStart}
      strokeCap={strokeCap}
      strokeWidth={thickness}
      style="stroke"
    />
  );
}

/**
 * An animated Skia progress ring with optional function-child center content.
 *
 * @example
 * <CircularProgress value={72}>{({ percentage }) => <Text>{percentage}%</Text>}</CircularProgress>
 */
export function CircularProgress({
  animated = true,
  arcLayout = "square",
  children,
  color,
  contentArea = "inner",
  durationMs = 420,
  max = 100,
  segmentGapAngle = 0,
  segmentMode = "sequential",
  segments,
  size = 96,
  startAngle = -90,
  style,
  strokeCap = "round",
  theme: themeOverride,
  thickness = 10,
  trackColor,
  sweepAngle = 360,
  value = 0,
  ...viewProps
}: CircularProgressProps) {
  if (!Number.isFinite(size) || size <= 0) {
    throw new RangeError("CircularProgress size must be a positive finite number.");
  }
  if (!Number.isFinite(thickness) || thickness <= 0 || thickness >= size) {
    throw new RangeError(
      "CircularProgress thickness must be a positive finite number smaller than size.",
    );
  }
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError(
      "CircularProgress durationMs must be a finite number greater than or equal to 0.",
    );
  }
  if (!Number.isFinite(startAngle)) {
    throw new RangeError("CircularProgress startAngle must be a finite number.");
  }
  if (!Number.isFinite(sweepAngle) || sweepAngle <= 0 || sweepAngle > 360) {
    throw new RangeError(
      "CircularProgress sweepAngle must be a finite number greater than 0 and less than or equal to 360.",
    );
  }

  const inheritedTheme = useCircularProgressTheme();
  const theme = useMemo(
    () => resolveCircularProgressTokens(inheritedTheme, themeOverride),
    [inheritedTheme, themeOverride],
  );
  const geometry = useMemo(
    () =>
      resolveCircularProgressArcGeometry(
        size,
        thickness,
        EDGE_INSET,
        startAngle,
        sweepAngle,
        arcLayout,
      ),
    [arcLayout, size, startAngle, sweepAngle, thickness],
  );
  const segmentResolution = useMemo(
    () =>
      segments === undefined
        ? undefined
        : resolveCircularProgressSegmentRanges(
            segments,
            max,
            sweepAngle,
            segmentGapAngle,
            strokeCap,
            thickness,
            geometry.pathRadius,
            segmentMode,
          ),
    [
      geometry.pathRadius,
      max,
      segmentGapAngle,
      segmentMode,
      segments,
      strokeCap,
      sweepAngle,
      thickness,
    ],
  );
  const segmentColors = useMemo(
    () =>
      new Map(
        segments?.map(({ color: segmentColor, id }) => [
          id,
          segmentColor,
        ]),
      ),
    [segments],
  );
  const currentValue = segmentResolution?.currentValue ?? value;
  const resolvedValue = resolveCircularProgressValue(currentValue, max);
  const progress = useSharedValue(resolvedValue);
  const path = useMemo(
    () => {
      if (sweepAngle === 360) {
        return Skia.Path.Circle(
          geometry.centerX,
          geometry.centerY,
          geometry.pathRadius,
        );
      }

      return Skia.PathBuilder.Make()
        .addArc(
          {
            height: geometry.pathRadius * 2,
            width: geometry.pathRadius * 2,
            x: geometry.centerX - geometry.pathRadius,
            y: geometry.centerY - geometry.pathRadius,
          },
          startAngle,
          sweepAngle,
        )
        .build();
    },
    [
      geometry.centerX,
      geometry.centerY,
      geometry.pathRadius,
      startAngle,
      sweepAngle,
    ],
  );
  const centerSize = Math.max(0, geometry.pathRadius * 2 - thickness);
  const centerHeight = Math.min(centerSize, geometry.canvasHeight);
  const centerWidth = Math.min(centerSize, geometry.canvasWidth);
  const rotation = sweepAngle === 360 ? (startAngle * Math.PI) / 180 : 0;
  const centerContent = children?.({
    max,
    percentage: Math.round(resolvedValue * 100),
    progress: resolvedValue,
    value: currentValue,
  });

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
    <View
      {...viewProps}
      style={[
        styles.root,
        { height: geometry.canvasHeight, width: geometry.canvasWidth },
        style,
      ]}
    >
      <Canvas
        style={[
          styles.canvas,
          {
            height: geometry.canvasHeight,
            width: geometry.canvasWidth,
          },
        ]}
      >
        <Group
          origin={vec(geometry.centerX, geometry.centerY)}
          transform={[{ rotate: rotation }]}
        >
          <Path
            color={trackColor ?? theme.trackColor}
            end={1}
            path={path}
            start={0}
            strokeCap={strokeCap}
            strokeWidth={thickness}
            style="stroke"
          />
          {segmentResolution === undefined ? (
            <Path
              color={color ?? theme.indicatorColor}
              end={progress}
              path={path}
              start={0}
              strokeCap={strokeCap}
              strokeWidth={thickness}
              style="stroke"
            />
          ) : (
            segmentResolution.ranges.map((range) => (
              <CircularProgressSegmentIndicator
                animated={animated}
                color={segmentColors.get(range.id)!}
                durationMs={durationMs}
                end={range.end}
                key={range.id}
                path={path}
                start={range.start}
                strokeCap={strokeCap}
                thickness={thickness}
              />
            ))
          )}
        </Group>
      </Canvas>
      {centerContent !== null && centerContent !== undefined ? (
        <View pointerEvents="none" style={styles.center}>
          <View
            style={[
              styles.centerViewport,
              contentArea === "inner"
                  ? {
                    borderRadius: Math.min(centerHeight, centerWidth) / 2,
                    height: centerHeight,
                    width: centerWidth,
                  }
                : styles.fullCenterViewport,
            ]}
          >
            {centerContent}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
  },
  canvas: {
    position: "absolute",
  },
  center: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  centerViewport: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullCenterViewport: {
    height: "100%",
    width: "100%",
  },
});
