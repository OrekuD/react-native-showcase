import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type EntryExitAnimationFunction,
} from "react-native-reanimated";

import { resolveButtonState } from "./buttonState";
import {
  resolveButtonTokens,
  type ButtonLabelTheme,
  type ButtonSize,
  type ButtonThemeOverride,
  type ButtonVariant,
} from "./buttonTheme";
import { useButtonTheme } from "./ButtonThemeProvider";

export type {
  ButtonAppearance,
  ButtonLabelTheme,
  ButtonSize,
  ButtonSizeTheme,
  ButtonTheme,
  ButtonThemeOverride,
  ButtonVariant,
} from "./buttonTheme";
export { ButtonThemeProvider } from "./ButtonThemeProvider";
export type { ButtonThemeProviderProps } from "./ButtonThemeProvider";

type SharedButtonProps = PressableProps & {
  /** Enables subtle impact feedback after a successful press. @default false */
  haptics?: boolean;
  /** Prevents interaction and swaps every icon slot for a loading indicator. */
  loading?: boolean;
  /** Overrides theme tokens for this button only. */
  theme?: ButtonThemeOverride;
  /** Controls the button's visual treatment. @default 'primary' */
  variant?: ButtonVariant;
};

/** Props accepted by the compound {@link Button} root. */
export type ButtonProps = SharedButtonProps &
  (
    | {
        /** Required because an icon-only button has no visible text label. */
        accessibilityLabel: string;
        /** Produces a square button containing only an icon. */
        size: "icon";
      }
    | {
        /** Optional accessible name when the visible label is insufficient. */
        accessibilityLabel?: string;
        /** Controls button height and spacing. @default 'md' */
        size?: Exclude<ButtonSize, "icon">;
      }
  );

type ButtonIconRenderProps = {
  color: string;
  size: number;
};

type ButtonIconProps = Omit<ViewProps, "children"> & {
  children: ReactNode | ((props: ButtonIconRenderProps) => ReactNode);
};

type ButtonContextValue = ButtonIconRenderProps & {
  label: Required<ButtonLabelTheme>;
  loading: boolean;
};

const ICON_ENTER_DURATION_MS = 180;
const ICON_EXIT_DURATION_MS = ICON_ENTER_DURATION_MS / 2;
const PRESS_IN_DURATION_MS = 120;
const PRESS_OUT_DURATION_MS = 90;
const PRESSED_SCALE = 0.97;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const ICON_ENTERING: EntryExitAnimationFunction = () => {
  "worklet";

  const config = {
    duration: ICON_ENTER_DURATION_MS,
    easing: EASE_OUT,
    reduceMotion: ReduceMotion.System,
  };

  return {
    animations: {
      opacity: withTiming(1, config),
      transform: [{ scale: withTiming(1, config) }],
    },
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.92 }],
    },
  };
};

const ICON_EXITING = FadeOut.duration(ICON_EXIT_DURATION_MS)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

const ButtonContext = createContext<ButtonContextValue | null>(null);
const AnimatedSquircleView = Animated.createAnimatedComponent(FastSquircleView);

function useButtonContext(componentName: string) {
  const context = useContext(ButtonContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside Button.`);
  }

  return context;
}

const ButtonRoot = forwardRef<View, ButtonProps>(function ButtonRoot(
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
          {...props}
        >
          {children}
        </Pressable>
      </AnimatedSquircleView>
    </ButtonContext.Provider>
  );
});

function ButtonLabel({ children, style, ...props }: TextProps) {
  const { color, label } = useButtonContext("Button.Label");

  return (
    <Text {...props} style={[{ color, ...label }, style]}>
      {children}
    </Text>
  );
}

function ButtonIcon({ children, style, ...props }: ButtonIconProps) {
  const { color, loading, size } = useButtonContext("Button.Icon");
  const icon =
    typeof children === "function" ? children({ color, size }) : children;

  return (
    <View
      {...props}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[style, styles.iconSlot, { height: size, width: size }]}
    >
      {loading ? (
        <Animated.View
          entering={ICON_ENTERING}
          exiting={ICON_EXITING}
          key="loading"
          style={styles.iconLayer}
        >
          <ActivityIndicator color={color} size="small" />
        </Animated.View>
      ) : (
        <Animated.View
          entering={ICON_ENTERING}
          exiting={ICON_EXITING}
          key="icon"
          style={styles.iconLayer}
        >
          {icon}
        </Animated.View>
      )}
    </View>
  );
}

/**
 * A composable pressable with variant, size, disabled, and loading states.
 * Compose its content with {@link Button.Label} and {@link Button.Icon}.
 */
export const Button = Object.assign(ButtonRoot, {
  Icon: ButtonIcon,
  Label: ButtonLabel,
});

const styles = StyleSheet.create({
  frame: {
    alignSelf: "stretch",
    borderRadius: 999,
    overflow: "hidden",
  },
  root: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.38,
  },
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    top: 1,
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
