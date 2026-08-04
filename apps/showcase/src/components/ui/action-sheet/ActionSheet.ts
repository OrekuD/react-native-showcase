import { ActionSheetContent } from "./ActionSheetContent";
import { ActionSheetRoot } from "./ActionSheetRoot";
import { ActionSheetTrigger } from "./ActionSheetTrigger";

export type { ActionSheetMode } from "./actionSheetState";
export type {
  ActionSheetTheme,
  ActionSheetThemeOverride,
  ResolvedActionSheetTheme,
} from "./actionSheetTheme";
export { ActionSheetThemeProvider } from "./ActionSheetThemeProvider";
export type { ActionSheetThemeProviderProps } from "./ActionSheetThemeProvider";
export type {
  ActionSheetAction,
  ActionSheetContentProps,
  ActionSheetIconProps,
  ActionSheetProps,
  ActionSheetRenderActionState,
  ActionSheetTriggerProps,
} from "./actionSheetShared";

export const ActionSheet = Object.assign(ActionSheetRoot, {
  Content: ActionSheetContent,
  Trigger: ActionSheetTrigger,
});
