import { createContext, useContext, type ReactNode } from "react";
import {
  StyleSheet,
  type PressableProps,
  type ViewProps,
} from "react-native";
import { Easing, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import type {
  ButtonLabelTheme,
  ButtonSize,
  ButtonThemeOverride,
  ButtonVariant,
} from "./buttonTheme";

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

export type ButtonIconRenderProps = {
  color: string;
  size: number;
};

export type ButtonIconProps = Omit<ViewProps, "children"> & {
  children: ReactNode | ((props: ButtonIconRenderProps) => ReactNode);
};

type ButtonContextValue = ButtonIconRenderProps & {
  label: Required<ButtonLabelTheme>;
  loading: boolean;
};

const ICON_ENTER_DURATION_MS = 280;
const ICON_EXIT_DURATION_MS = ICON_ENTER_DURATION_MS * 0.7;
export const PRESS_IN_DURATION_MS = 120;
export const PRESS_OUT_DURATION_MS = 90;
export const PRESSED_SCALE = 0.97;
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const ICON_ENTERING = ZoomIn.duration(ICON_ENTER_DURATION_MS)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.42 }] })
  .reduceMotion(ReduceMotion.System);

export const ICON_EXITING = ZoomOut.duration(ICON_EXIT_DURATION_MS)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const ButtonContext = createContext<ButtonContextValue | null>(null);

export function useButtonContext(componentName: string) {
  const context = useContext(ButtonContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside Button.`);
  }

  return context;
}

export const styles = StyleSheet.create({
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
