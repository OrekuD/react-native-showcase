import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuRoot } from "./MenuRoot";
import { MenuSection } from "./MenuSection";
import { MenuSeparator } from "./MenuSeparator";
import { MenuTrigger } from "./MenuTrigger";

export type { MenuAlign, MenuMode, MenuSize } from "./menuState";
export type { MenuTheme, MenuThemeOverride, ResolvedMenuTheme } from "./menuTheme";
export { MenuThemeProvider } from "./MenuThemeProvider";
export type { MenuThemeProviderProps } from "./MenuThemeProvider";
export type {
  MenuContentProps,
  MenuItemProps,
  MenuProps,
  MenuSectionProps,
  MenuTriggerProps,
  NativeMenuAction,
} from "./menuShared";

/**
 * A composed menu that uses Expo UI's MenuView in native mode and a
 * collision-aware rn-primitives popover in custom mode.
 */
export const Menu = Object.assign(MenuRoot, {
  Content: MenuContent,
  Item: MenuItem,
  Section: MenuSection,
  Separator: MenuSeparator,
  Trigger: MenuTrigger,
});
