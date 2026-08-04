import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { createContext, useContext, type ReactElement, type ReactNode, type RefObject } from "react";
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

import type {
  ActionSheetDismissReason,
  ActionSheetMode,
  ResolvedActionSheetMode,
} from "./actionSheetState";
import type { ResolvedActionSheetTheme } from "./actionSheetTheme";

export type ActionSheetIconProps = Readonly<{ color: string; size: number }>;

export type ActionSheetAction = Readonly<{
  accessibilityLabel?: string;
  description?: string;
  destructive?: boolean;
  disabled?: boolean;
  icon?: (props: ActionSheetIconProps) => ReactNode;
  id: string;
  label: string;
  onPress?: () => void;
  separatorBefore?: boolean;
}>;

type ActionSheetBaseProps = {
  actions: readonly ActionSheetAction[];
  cancelLabel?: string;
  children: ReactNode;
  dismissible?: boolean;
  haptics?: boolean;
  message?: string;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (action: ActionSheetAction) => void;
  testID?: string;
  title?: string;
};

type AutomaticActionSheetProps = ActionSheetBaseProps & {
  defaultOpen?: never;
  mode?: Extract<ActionSheetMode, "automatic">;
  open?: never;
};

type CustomActionSheetProps = ActionSheetBaseProps & {
  defaultOpen?: boolean;
  mode: Extract<ActionSheetMode, "custom">;
  open?: boolean;
};

export type ActionSheetProps =
  | AutomaticActionSheetProps
  | CustomActionSheetProps;

export type ActionSheetTriggerChildProps = Pick<
  PressableProps,
  "accessibilityRole" | "disabled" | "onPress" | "testID"
>;

export type ActionSheetTriggerProps = {
  children: ReactElement<ActionSheetTriggerChildProps>;
};

export type ActionSheetRenderActionState = Readonly<{
  close: () => void;
  select: () => void;
  theme: ResolvedActionSheetTheme;
}>;

export type ActionSheetContentProps = {
  cornerSmoothing?: number;
  gap?: number;
  inset?: number;
  itemCornerSmoothing?: number;
  itemLabelStyle?: StyleProp<TextStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  renderAction?: (
    action: ActionSheetAction,
    state: ActionSheetRenderActionState
  ) => ReactNode;
  showHandle?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export type ActionSheetContextValue = {
  actions: readonly ActionSheetAction[];
  dismissible: boolean;
  dismissReasonRef: RefObject<ActionSheetDismissReason>;
  haptics: boolean;
  message: string | undefined;
  mode: ResolvedActionSheetMode;
  onCustomDismiss: (cancelled: boolean) => void;
  openSheet: () => void;
  selectAction: (action: ActionSheetAction) => void;
  sheetRef: RefObject<TrueSheet | null>;
  testID: string | undefined;
  theme: ResolvedActionSheetTheme;
  title: string | undefined;
};

export const ActionSheetContext = createContext<ActionSheetContextValue | null>(
  null
);

export function useActionSheetContext(componentName: string) {
  const context = useContext(ActionSheetContext);
  if (!context) {
    throw new Error(`${componentName} must be used inside ActionSheet.`);
  }
  return context;
}

export function callChildPress(
  onPress: ActionSheetTriggerChildProps["onPress"],
  event: GestureResponderEvent
) {
  onPress?.(event);
}
