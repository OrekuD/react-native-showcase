import type { MenuAction } from "@expo/ui/community/menu";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { createContext, useContext, type ReactElement, type ReactNode, type RefObject } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";
import Animated, { Easing, FadeOut, ReduceMotion, ZoomIn } from "react-native-reanimated";

import type { MenuAlign, MenuMode, MenuSize } from "./menuState";
import type { MenuThemeOverride, ResolvedMenuTheme } from "./menuTheme";

/** Expo-compatible actions rendered by Menu in native mode. */
export type NativeMenuAction = MenuAction;

type CustomMenuProps = {
  /** The trigger and custom content primitives that make up the menu. */
  children: ReactNode;
  /** Initial visibility for an uncontrolled custom menu. */
  defaultOpen?: boolean;
  /** Uses Showcase's custom menu treatment. */
  mode?: "custom";
  /** Receives visibility changes from the custom trigger, items, and backdrop. */
  onOpenChange?: (open: boolean) => void;
  /** Controls a custom menu's visibility. */
  open?: boolean;
  /** Opens the custom menu from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to the custom trigger. */
  testID?: string;
  /** Overrides visual tokens for this custom menu only. */
  theme?: MenuThemeOverride;
};

type NativeMenuProps = {
  /** Expo-compatible actions rendered by the platform menu. */
  actions: readonly NativeMenuAction[];
  /** The menu trigger. Render Menu.Trigger around one pressable child. */
  children: ReactNode;
  /** Uses Expo UI's platform menu implementation. */
  mode: "native";
  /** Receives the id of the selected native menu action. */
  onSelect?: (id: string) => void;
  /** Opens the native menu from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to Expo UI's native trigger wrapper. */
  testID?: string;
  /** Native menu title. It is displayed by iOS only. */
  title?: string;
};

/** Props accepted by the composed Menu root. */
export type MenuProps = CustomMenuProps | NativeMenuProps;

export type MenuContextValue = {
  mode: MenuMode;
  shouldOpenOnLongPress: boolean;
  size: MenuSize;
  testID: string | undefined;
  theme: ResolvedMenuTheme;
  triggerRef: RefObject<DropdownMenuPrimitive.TriggerRef | null>;
};

export type TriggerChildProps = Pick<PressableProps, "accessibilityRole" | "disabled" | "onLongPress" | "onPress">;

/** Props accepted by Menu.Trigger. */
export type MenuTriggerProps = { children: ReactElement<TriggerChildProps> };

/** Props accepted by Menu.Content. */
export type MenuContentProps = {
  /** Positions content against the trigger's start or end edge. @default "end" */
  align?: MenuAlign;
  /** Menu sections, separators, and items. */
  children: ReactNode;
  /** Space between the trigger and menu content. @default 8 */
  sideOffset?: number;
  /** The density used by all menu items. @default "default" */
  size?: MenuSize;
};

/** Props accepted by Menu.Section. */
export type MenuSectionProps = { children: ReactNode; title?: string };

/** Props accepted by Menu.Item. */
export type MenuItemProps = {
  children: ReactNode;
  description?: string;
  destructive?: boolean;
  disabled?: boolean;
  haptics?: boolean;
  icon?: ReactNode;
  onSelect?: () => void;
};

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(componentName: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(`${componentName} must be used inside Menu.`);
  }
  return context;
}

export const MENU_ITEM_PRESS_IN_DURATION_MS = 120;
export const MENU_ITEM_PRESS_OUT_DURATION_MS = 90;
export const MENU_ITEM_PRESSED_SCALE = 0.97;
export const CONTENT_EDGE_INSET = 16;
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const CONTENT_ENTERING = ZoomIn.duration(190)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.96 }] })
  .reduceMotion(ReduceMotion.System);
export const CONTENT_EXITING = FadeOut.duration(130)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);
export const AnimatedMenuItem = Animated.createAnimatedComponent(Pressable);

export const styles = StyleSheet.create({
  panel: { overflow: "hidden", padding: 12 },
  panelCompact: { padding: 8 },
  panelChrome: { ...StyleSheet.absoluteFill, borderWidth: 1 },
  panelSurface: { ...StyleSheet.absoluteFill },
  content: { gap: 8 },
  contentCompact: { gap: 6 },
  section: { gap: 8 },
  sectionCompact: { gap: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1.1, paddingHorizontal: 8, paddingTop: 2 },
  sectionTitleCompact: { fontSize: 10, letterSpacing: 1, paddingHorizontal: 6 },
  sectionItems: { gap: 4 },
  sectionItemsCompact: { gap: 2 },
  item: { alignItems: "center", borderRadius: 22, flexDirection: "row", gap: 14, minHeight: 64, paddingHorizontal: 10, paddingVertical: 8 },
  itemCompact: { gap: 10, minHeight: 48, paddingHorizontal: 8, paddingVertical: 6 },
  itemDisabled: { opacity: 0.42 },
  iconContainer: { alignItems: "center", borderRadius: 22.5, height: 45, justifyContent: "center", width: 45 },
  iconContainerCompact: { borderRadius: 18, height: 36, width: 36 },
  iconCompact: { transform: [{ scale: 0.82 }] },
  itemCopy: { flex: 1, gap: 2 },
  itemCopyCompact: { gap: 1 },
  itemLabel: { fontSize: 18, fontWeight: "600", letterSpacing: -0.25 },
  itemLabelCompact: { fontSize: 16, letterSpacing: -0.15 },
  itemDescription: { fontSize: 13, lineHeight: 18 },
  itemDescriptionCompact: { fontSize: 12, lineHeight: 16 },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 8, marginVertical: 4 },
  separatorCompact: { marginHorizontal: 6, marginVertical: 3 },
});
