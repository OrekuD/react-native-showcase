import { SelectContent } from "./SelectContent";
import { SelectGroup } from "./SelectGroup";
import { SelectItem } from "./SelectItem";
import { SelectRoot } from "./SelectRoot";
import { SelectTrigger } from "./SelectTrigger";
import { SelectValue } from "./SelectValue";

export type { SelectAlign, SelectMode, SelectSize } from "./selectState";
export type { ResolvedSelectTheme, SelectTheme, SelectThemeOverride } from "./selectTheme";
export { SelectThemeProvider } from "./SelectThemeProvider";
export type { SelectThemeProviderProps } from "./SelectThemeProvider";
export type { SelectContentProps, SelectGroupProps, SelectItemProps, SelectProps, SelectTriggerProps } from "./selectShared";

/**
 * A composed single-select control with a custom popover by default and an
 * Expo UI menu implementation that marks the selected native action.
 */
export const Select = Object.assign(SelectRoot, {
  Content: SelectContent,
  Group: SelectGroup,
  Item: SelectItem,
  Trigger: SelectTrigger,
  Value: SelectValue,
});
