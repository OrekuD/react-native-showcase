import { ButtonIcon } from "./ButtonIcon";
import { ButtonLabel } from "./ButtonLabel";
import { ButtonRoot } from "./ButtonRoot";

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
export type { ButtonIconProps, ButtonProps } from "./buttonShared";

/**
 * A composable pressable with variant, size, disabled, and loading states.
 * Compose its content with {@link Button.Label} and {@link Button.Icon}.
 */
export const Button = Object.assign(ButtonRoot, {
  Icon: ButtonIcon,
  Label: ButtonLabel,
});
