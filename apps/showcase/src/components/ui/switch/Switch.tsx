import { useEffect, type ReactNode } from "react";
import * as Haptics from "expo-haptics";
import {
  Pressable,
  StyleSheet,
  Switch as NativeSwitch,
  Text,
  View,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  ReduceMotion,
  ZoomIn,
  ZoomOut,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  resolveSwitchMode,
  resolveSwitchThumbLayout,
  resolveSwitchVariant,
  type SwitchMode,
  type SwitchVariant,
} from "./switchState";
import { useSwitchTheme } from "./SwitchThemeProvider";
import { resolveSwitchTokens, type SwitchThemeOverride } from "./switchTheme";

export type { SwitchMode, SwitchVariant } from "./switchState";
export type {
  SwitchColorTheme,
  SwitchTheme,
  SwitchThemeOverride,
} from "./switchTheme";
export { SwitchThemeProvider } from "./SwitchThemeProvider";
export type { SwitchThemeProviderProps } from "./SwitchThemeProvider";

/** Icons rendered inside the custom switch thumb for each checked state. */
export type SwitchThumbIcons = {
  /** Icon rendered when the switch is on. */
  on?: ReactNode;
  /** Icon rendered when the switch is off. */
  off?: ReactNode;
};

/** Props accepted by {@link Switch}. */
export type SwitchProps = {
  /** Supporting text displayed below the label. */
  description?: string;
  /** Prevents the switch from being changed. @default false */
  disabled?: boolean;
  /** Enables selection feedback when the switch changes. @default false */
  haptics?: boolean;
  /** Visible and accessible name for the switch. */
  label: string;
  /** Selects the native platform control or Showcase's custom control. @default 'custom' */
  mode?: SwitchMode;
  /** Runs with the next checked value after the switch is pressed. */
  onValueChange: (value: boolean) => void;
  /** Identifier used by automated tests. */
  testID?: string;
  /** Overrides the shared on/off palette for this Switch only. */
  theme?: SwitchThemeOverride;
  /** Optional icons swapped inside the custom thumb as the value changes. */
  thumbIcons?: SwitchThumbIcons;
  /** Selects the custom visual treatment. Ignored by native mode. @default 'solid' */
  variant?: SwitchVariant;
  /** Controlled checked value. */
  value: boolean;
};

const COLOR_DURATION_MS = 140;
const ICON_ENTER_DURATION_MS = 280;
const ICON_EXIT_DURATION_MS = ICON_ENTER_DURATION_MS * 0.7;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const ICON_ENTERING = ZoomIn.duration(ICON_ENTER_DURATION_MS)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.42 }] })
  .reduceMotion(ReduceMotion.System);

const ICON_EXITING = ZoomOut.duration(ICON_EXIT_DURATION_MS)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

const AnimatedSquircleView = Animated.createAnimatedComponent(FastSquircleView);

function SwitchThumbIcon({
  icons,
  value,
}: {
  icons: SwitchThumbIcons | undefined;
  value: boolean;
}) {
  const icon = value ? icons?.on : icons?.off;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.iconSlot}
    >
      {icon === undefined || icon === null ? null : (
        <Animated.View
          entering={ICON_ENTERING}
          exiting={ICON_EXITING}
          key={value ? "on" : "off"}
          style={styles.iconLayer}
        >
          {icon}
        </Animated.View>
      )}
    </View>
  );
}

function CustomSwitch({
  disabled,
  haptics,
  label,
  onValueChange,
  testID,
  theme,
  thumbIcons,
  value,
  variant,
}: SwitchProps & { variant: SwitchVariant }) {
  const inheritedTheme = useSwitchTheme();
  const tokens = resolveSwitchTokens(inheritedTheme, variant, theme);
  const { thumbSize, thumbTravel } = resolveSwitchThumbLayout(tokens.layout);
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: COLOR_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [progress, value]);

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [tokens.off.trackColor, tokens.on.trackColor]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [tokens.off.borderColor, tokens.on.borderColor]
    ),
  }));
  const animatedThumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [tokens.off.thumbColor, tokens.on.thumbColor]
    ),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, thumbTravel]),
      },
    ],
  }));

  const handlePress = () => {
    if (haptics) {
      void Haptics.selectionAsync();
    }

    onValueChange(!value);
  };

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [styles.control, pressed && styles.pressed]}
      testID={testID}
    >
      <AnimatedSquircleView
        cornerSmoothing={tokens.cornerSmoothing}
        style={[
          styles.track,
          {
            borderRadius: tokens.layout.trackHeight / 2,
            borderWidth: tokens.layout.borderWidth,
            height: tokens.layout.trackHeight,
            width: tokens.layout.trackWidth,
          },
          animatedTrackStyle,
        ]}
      >
        <AnimatedSquircleView
          cornerSmoothing={tokens.cornerSmoothing}
          style={[
            styles.thumb,
            {
              borderRadius: thumbSize / 2,
              height: thumbSize,
              left: tokens.layout.thumbInset,
              top: tokens.layout.thumbInset,
              width: thumbSize,
            },
            animatedThumbStyle,
          ]}
        >
          <SwitchThumbIcon icons={thumbIcons} value={value} />
        </AnimatedSquircleView>
      </AnimatedSquircleView>
    </Pressable>
  );
}

function NativeSwitchControl({
  disabled,
  haptics,
  label,
  onValueChange,
  testID,
  theme,
  value,
}: SwitchProps) {
  const inheritedTheme = useSwitchTheme();
  const tokens = resolveSwitchTokens(inheritedTheme, "solid", theme);

  const handleValueChange = (nextValue: boolean) => {
    if (haptics && nextValue !== value) {
      void Haptics.selectionAsync();
    }

    onValueChange(nextValue);
  };

  return (
    <View>
      <NativeSwitch
        accessibilityLabel={label}
        disabled={disabled}
        ios_backgroundColor={tokens.off.trackColor}
        onValueChange={handleValueChange}
        testID={testID}
        thumbColor={value ? tokens.on.thumbColor : tokens.off.thumbColor}
        trackColor={{
          false: tokens.off.trackColor,
          true: tokens.on.trackColor,
        }}
        value={value}
      />
    </View>
  );
}

/**
 * A labeled controlled switch that can render React Native's native control or
 * a themed custom treatment.
 */
export function Switch({
  description,
  disabled = false,
  haptics = false,
  label,
  mode,
  onValueChange,
  testID,
  theme,
  thumbIcons,
  value,
  variant,
}: SwitchProps) {
  const resolvedMode = resolveSwitchMode(mode);
  const resolvedVariant = resolveSwitchVariant(variant);

  return (
    <FastSquircleView
      cornerSmoothing={0.85}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {resolvedMode === "native" ? (
        <NativeSwitchControl
          disabled={disabled}
          haptics={haptics}
          label={label}
          onValueChange={onValueChange}
          testID={testID}
          theme={theme}
          value={value}
        />
      ) : (
        <CustomSwitch
          description={description}
          disabled={disabled}
          haptics={haptics}
          label={label}
          mode={resolvedMode}
          onValueChange={onValueChange}
          testID={testID}
          theme={theme}
          thumbIcons={thumbIcons}
          value={value}
          variant={resolvedVariant}
        />
      )}
    </FastSquircleView>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCD9D0",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: "#1D1D1B",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  description: {
    color: "#77736B",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  control: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.84,
  },
  track: {
    overflow: "hidden",
  },
  thumb: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  iconSlot: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  iconLayer: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
