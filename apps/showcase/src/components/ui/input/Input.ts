import { InputAction } from "./InputAction";
import { InputControl } from "./InputControl";
import { InputIcon } from "./InputIcon";
import { InputLabel } from "./InputLabel";
import { InputLeading } from "./InputLeading";
import { InputMessage } from "./InputMessage";
import { InputPasswordToggle } from "./InputPasswordToggle";
import { InputRoot } from "./InputRoot";
import { InputTrailing } from "./InputTrailing";

export type { InputAppearance, InputSize } from "./inputState";
export type {
  InputAppearanceTheme,
  InputColorTheme,
  InputSizeTheme,
  InputTheme,
  InputThemeOverride,
} from "./inputTheme";
export { InputThemeProvider } from "./InputThemeProvider";
export type { InputThemeProviderProps } from "./InputThemeProvider";
export type { InputProps } from "./inputShared";

/** A composable React Native text input with four visual appearances. */
export const Input = Object.assign(InputRoot, {
  Action: InputAction,
  Control: InputControl,
  Icon: InputIcon,
  Label: InputLabel,
  Leading: InputLeading,
  Message: InputMessage,
  PasswordToggle: InputPasswordToggle,
  Root: InputRoot,
  Trailing: InputTrailing,
});
