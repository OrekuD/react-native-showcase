import { createContext, useContext, type ForwardedRef, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type TextInputProps as NativeTextInputProps,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { Easing, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import type { InputAppearance, InputMessageTone, InputSize, InputStatus } from "./inputState";
import type { InputThemeOverride, ResolvedInputSizeTheme, ResolvedInputTokens } from "./inputTheme";

export type InputContextValue = {
  accessibilityLabel?: string;
  appearance: InputAppearance;
  colors: ResolvedInputTokens["colors"];
  disabled: boolean;
  fieldBackgroundColor: string;
  focusColor: string;
  focused: boolean;
  hasCustomTrailing: boolean;
  hasLabel: boolean;
  hasLeading: boolean;
  hasTrailing: boolean;
  iconColor: string;
  labelBackgroundColor: string;
  sizeTokens: ResolvedInputSizeTheme;
  secureEntry: boolean;
  secureVisible: boolean;
  setFocused: (focused: boolean) => void;
  status: InputStatus;
  toggleSecureEntry: () => void;
};

export type InputRootProps = Omit<ViewProps, "children"> & {
  /** Accessible name applied to the native text field when it has no label. */
  accessibilityLabel?: string;
  /** Selects the visual treatment for the composed field. */
  appearance?: InputAppearance;
  /** Disables the field and its trailing actions. @default false */
  disabled?: boolean;
  /** Promotes the field to an error state without requiring an error message. */
  invalid?: boolean;
  /** Changes the focused border, label, caret, and active adornment color. */
  focusColor?: string;
  /** Color painted behind labels that overlap the field border. */
  labelBackgroundColor?: string;
  /** Controls field height, typography, spacing, and trailing touch targets. @default 'md' */
  size?: InputSize;
  /** Enables secure text entry and adds the default password visibility action. */
  secureEntry?: boolean;
  /** Selects the semantic visual state. @default 'default' */
  status?: InputStatus;
  /** Overrides theme tokens for this Input only. */
  theme?: InputThemeOverride;
  /** Styles the field shell without changing the outer message layout. */
  fieldStyle?: ViewStyle;
  children?: ReactNode;
};

export type InputProps = InputRootProps;

export type InputLabelProps = TextProps & {
  children: ReactNode;
  required?: boolean;
};

export type InputControlProps = NativeTextInputProps & {
  /** Adds a clear action while the input contains text. @default false */
  clearable?: boolean;
};

export type InputTrailingProps = Omit<ViewProps, "children"> & {
  children?: ReactNode;
};

export type InputLeadingProps = InputTrailingProps;

export type InputIconRenderProps = {
  color: string;
  size: number;
};

export type InputIconProps = Omit<ViewProps, "children"> & {
  /** Overrides the status-based key used to animate a custom icon swap. */
  animationKey?: string | number;
  children: ReactNode | ((props: InputIconRenderProps) => ReactNode);
};

export type InputActionProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
};

export type InputPasswordToggleRenderProps = InputIconRenderProps & {
  visible: boolean;
};

export type InputPasswordToggleProps = Omit<PressableProps, "children"> & {
  children?: ReactNode | ((props: InputPasswordToggleRenderProps) => ReactNode);
};

export type InputMessageProps = TextProps & {
  children: ReactNode;
  tone?: InputMessageTone;
};

const ICON_ENTER_DURATION_MS = 280;
const ICON_EXIT_DURATION_MS = ICON_ENTER_DURATION_MS * 0.7;
const ICON_EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ICON_SIZE = 20;

export const ICON_ENTERING = ZoomIn.duration(ICON_ENTER_DURATION_MS)
  .easing(ICON_EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.42 }] })
  .reduceMotion(ReduceMotion.System);

export const ICON_EXITING = ZoomOut.duration(ICON_EXIT_DURATION_MS)
  .easing(ICON_EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const InputContext = createContext<InputContextValue | null>(null);

export function useInputContext(componentName: string) {
  const context = useContext(InputContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside Input.`);
  }

  return context;
}

export function appearanceSuffix(value: InputAppearance): Capitalize<InputAppearance> {
  return `${value[0].toUpperCase()}${value.slice(1)}` as Capitalize<InputAppearance>;
}

export function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const styles = StyleSheet.create({
  root: { gap: 7, width: "100%" },
  field: { alignItems: "center", flexDirection: "row", overflow: "visible", position: "relative" },
  fieldFilled: {},
  fieldStacked: {},
  fieldNotched: {},
  fieldNotchedWithLabel: { marginTop: 10 },
  fieldExternal: {},
  fieldDisabled: { opacity: 0.5 },
  label: { fontSize: 14, fontWeight: "600", lineHeight: 18, position: "absolute", zIndex: 2 },
  labelFilled: { left: 17, top: 10 },
  labelStacked: { left: 17, top: 10 },
  labelNotched: { left: 13, paddingHorizontal: 5, top: -10 },
  labelExternal: { left: 14 },
  control: { flex: 1, fontSize: 17, includeFontPadding: false, minHeight: 56, paddingHorizontal: 16, paddingVertical: 14 },
  controlFilled: { minHeight: 64, paddingHorizontal: 19 },
  controlStacked: { minHeight: 70, paddingTop: 30 },
  controlNotched: { minHeight: 62, paddingTop: 17 },
  controlExternal: { minHeight: 50 },
  controlFilledWithLabel: { paddingTop: 25 },
  controlWithTrailing: { paddingRight: 56 },
  trailing: { alignItems: "center", bottom: 0, justifyContent: "center", minWidth: 52, paddingHorizontal: 4, position: "absolute", right: 0, top: 0 },
  leading: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, minWidth: 52, paddingHorizontal: 4, position: "absolute", top: 0 },
  action: { alignItems: "center", borderRadius: 999, height: 44, justifyContent: "center", minWidth: 44, paddingHorizontal: 8 },
  actionDisabled: { opacity: 0.65 },
  icon: { alignItems: "center", height: ICON_SIZE, justifyContent: "center", width: ICON_SIZE },
  passwordIcon: { height: ICON_SIZE, position: "relative", width: ICON_SIZE },
  iconLayer: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  message: { fontSize: 13, lineHeight: 18, paddingHorizontal: 4 },
});
