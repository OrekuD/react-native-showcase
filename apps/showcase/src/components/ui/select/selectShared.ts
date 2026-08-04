import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { createContext, useContext, type ReactElement, type ReactNode, type RefObject } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";
import Animated, { Easing, FadeOut, ReduceMotion, ZoomIn } from "react-native-reanimated";

import type { SelectAlign, SelectMode, SelectSize } from "./selectState";
import type { ResolvedSelectTheme, SelectThemeOverride } from "./selectTheme";

type SharedSelectProps = {
  /** The trigger and select content primitives that make up the control. */
  children: ReactNode;
  /** Initial selected value for an uncontrolled select. */
  defaultValue?: string;
  /** Prevents the trigger from opening the list. */
  disabled?: boolean;
  /** Receives the selected item value. */
  onValueChange?: (value: string) => void;
  /** Opens the select from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to the trigger. */
  testID?: string;
  /** Controls the selected item. */
  value?: string;
};

type CustomSelectProps = SharedSelectProps & {
  defaultOpen?: boolean;
  mode?: "custom";
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  theme?: SelectThemeOverride;
};

type NativeSelectProps = SharedSelectProps & { mode: "native"; title?: string };

/** Props accepted by the composed Select root. */
export type SelectProps = CustomSelectProps | NativeSelectProps;

export type SelectOption = {
  disabled: boolean;
  groupLabel: string | undefined;
  label: string;
  value: string;
};

export type SelectContextValue = {
  disabled: boolean;
  mode: SelectMode;
  options: readonly SelectOption[];
  selectValue: (value: string) => void;
  selectedOption: SelectOption | undefined;
  shouldOpenOnLongPress: boolean;
  size: SelectSize;
  testID: string | undefined;
  theme: ResolvedSelectTheme;
  triggerRef: RefObject<DropdownMenuPrimitive.TriggerRef | null>;
};

export type TriggerChildProps = Pick<PressableProps, "accessibilityRole" | "disabled" | "onLongPress" | "onPress">;
/** Props accepted by Select.Trigger. */
export type SelectTriggerProps = { children: ReactElement<TriggerChildProps> };
/** Props accepted by Select.Content. */
export type SelectContentProps = { align?: SelectAlign; children: ReactNode; sideOffset?: number; size?: SelectSize };
/** Props accepted by Select.Group. */
export type SelectGroupProps = { children: ReactNode; label?: string };
/** Props accepted by Select.Item. */
export type SelectItemProps = { children: ReactNode; description?: string; disabled?: boolean; haptics?: boolean; icon?: ReactNode; label?: string; value: string };

export const SelectContext = createContext<SelectContextValue | null>(null);
export function useSelectContext(componentName: string): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) throw new Error(`${componentName} must be used inside Select.`);
  return context;
}

export const SELECT_ITEM_PRESS_IN_DURATION_MS = 120;
export const SELECT_ITEM_PRESS_OUT_DURATION_MS = 90;
export const SELECT_ITEM_PRESSED_SCALE = 0.97;
export const CONTENT_EDGE_INSET = 16;
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const CONTENT_ENTERING = ZoomIn.duration(190).easing(EASE_OUT).withInitialValues({ transform: [{ scale: 0.96 }] }).reduceMotion(ReduceMotion.System);
export const CONTENT_EXITING = FadeOut.duration(130).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
export const AnimatedSelectItem = Animated.createAnimatedComponent(Pressable);

export const styles = StyleSheet.create({
  panel: { overflow: "hidden", padding: 12 },
  panelCompact: { padding: 8 },
  panelChrome: { ...StyleSheet.absoluteFill, borderWidth: 1 },
  panelSurface: { ...StyleSheet.absoluteFill },
  content: { gap: 8 },
  contentCompact: { gap: 6 },
  group: { gap: 8 },
  groupCompact: { gap: 6 },
  groupLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.1, paddingHorizontal: 8, paddingTop: 2 },
  groupLabelCompact: { fontSize: 10, letterSpacing: 1, paddingHorizontal: 6 },
  groupItems: { gap: 4 },
  groupItemsCompact: { gap: 2 },
  item: { alignItems: "center", borderRadius: 22, flexDirection: "row", gap: 14, minHeight: 64, paddingHorizontal: 10, paddingVertical: 8 },
  itemCompact: { gap: 10, minHeight: 48, paddingHorizontal: 8, paddingVertical: 6 },
  itemDisabled: { opacity: 0.42 },
  iconContainer: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  iconContainerCompact: { borderRadius: 15, height: 30, width: 30 },
  iconCompact: { transform: [{ scale: 0.82 }] },
  itemCopy: { flex: 1, gap: 2 },
  itemCopyCompact: { gap: 1 },
  itemLabel: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  itemLabelCompact: { fontSize: 15, letterSpacing: -0.1 },
  itemDescription: { fontSize: 13, lineHeight: 18 },
  itemDescriptionCompact: { fontSize: 12, lineHeight: 16 },
  checkmark: { alignItems: "center", height: 28, justifyContent: "center", width: 28 },
  checkmarkCompact: { height: 24, width: 24 },
});
