import { Children, forwardRef, isValidElement, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";

import {
  resolveInputExternalLabelOffset,
  resolveInputFocusColors,
  resolveInputSize,
  resolveInputStatus,
} from "./inputState";
import { resolveInputTokens } from "./inputTheme";
import { InputControl } from "./InputControl";
import { InputLabel } from "./InputLabel";
import { InputLeading } from "./InputLeading";
import { InputMessage } from "./InputMessage";
import { InputPasswordToggle } from "./InputPasswordToggle";
import { InputTrailing } from "./InputTrailing";
import { useInputTheme } from "./InputThemeProvider";
import {
  appearanceSuffix,
  InputContext,
  styles,
  type InputContextValue,
  type InputControlProps,
  type InputRootProps,
} from "./inputShared";

function isInputChild(child: ReactNode, component: unknown) {
  return isValidElement(child) && child.type === component;
}

function isClearableControl(child: ReactNode) {
  return (
    isValidElement<InputControlProps>(child) &&
    child.type === InputControl &&
    child.props.clearable === true
  );
}

export const InputRoot = forwardRef<View, InputRootProps>(function InputRoot(
  {
    accessibilityLabel,
    appearance = "filled",
    children,
    disabled = false,
    fieldStyle,
    focusColor,
    invalid = false,
    labelBackgroundColor,
    size,
    secureEntry = false,
    status,
    style,
    theme,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);
  const inheritedTheme = useInputTheme();
  const resolvedSize = resolveInputSize(size);
  const tokens = useMemo(
    () => resolveInputTokens(inheritedTheme, appearance, resolvedSize, theme),
    [appearance, inheritedTheme, resolvedSize, theme]
  );
  const focusedColors = resolveInputFocusColors({
    appearance,
    defaultColor: tokens.colors.focus,
    defaultBorderColor: tokens.colors.focusBorder,
    filledDefaultBorderColor: tokens.colors.filledFocusBorder,
    focusColor,
  });
  const resolvedLabelBackgroundColor = labelBackgroundColor ?? tokens.colors.labelBackground;
  const externalLabelOffset = resolveInputExternalLabelOffset(tokens.size.labelLineHeight);
  const childArray = Children.toArray(children);
  const resolvedStatus = resolveInputStatus({ invalid, status });
  const hasLabel = childArray.some((child) => isInputChild(child, InputLabel));
  const hasLeading = childArray.some((child) => isInputChild(child, InputLeading));
  const hasTrailing = childArray.some((child) => isInputChild(child, InputTrailing));
  const hasClearableControl = !secureEntry && !hasTrailing && childArray.some(isClearableControl);
  const messages = childArray.filter((child) => isInputChild(child, InputMessage));
  const fieldChildren = childArray.filter((child) => !isInputChild(child, InputMessage));
  const shouldRenderDefaultPasswordToggle = secureEntry && !hasTrailing;
  const iconColor = disabled
    ? tokens.colors.disabled
    : resolvedStatus === "error"
    ? tokens.colors.error
    : resolvedStatus === "success"
    ? tokens.colors.success
    : focused
    ? focusedColors.contentColor
    : tokens.colors.muted;
  const contextValue = useMemo<InputContextValue>(
    () => ({
      accessibilityLabel,
      appearance,
      colors: tokens.colors,
      disabled,
      fieldBackgroundColor: tokens.appearance.backgroundColor,
      focusColor: focusedColors.contentColor,
      focused,
      hasCustomTrailing: hasTrailing,
      hasLabel,
      hasLeading,
      hasTrailing: hasTrailing || shouldRenderDefaultPasswordToggle || hasClearableControl,
      iconColor,
      labelBackgroundColor: resolvedLabelBackgroundColor,
      sizeTokens: tokens.size,
      secureEntry,
      secureVisible,
      setFocused,
      status: resolvedStatus,
      toggleSecureEntry: () => setSecureVisible((visible) => !visible),
    }),
    [accessibilityLabel, appearance, disabled, tokens.appearance.backgroundColor, focusedColors.contentColor, focused, hasClearableControl, hasLabel, hasLeading, hasTrailing, iconColor, resolvedLabelBackgroundColor, resolvedStatus, secureEntry, secureVisible, shouldRenderDefaultPasswordToggle, tokens.colors, tokens.size]
  );

  return (
    <InputContext.Provider value={contextValue}>
      <View {...props} ref={ref} style={[styles.root, style]}>
        <FastSquircleView
          cornerSmoothing={tokens.cornerSmoothing}
          style={[
            styles.field,
            styles[`field${appearanceSuffix(appearance)}`],
            {
              backgroundColor: tokens.appearance.backgroundColor,
              borderColor: tokens.appearance.borderColor,
              borderRadius: tokens.appearance.borderRadius,
              borderWidth: tokens.appearance.borderWidth,
              minHeight: tokens.size.fieldHeight,
            },
            hasLabel && appearance === "notched" && styles.fieldNotchedWithLabel,
            hasLabel && appearance === "external" && { marginTop: externalLabelOffset },
            resolvedStatus === "error" && { borderColor: tokens.colors.error },
            resolvedStatus === "success" && { borderColor: tokens.colors.success },
            focused && resolvedStatus === "default" && { borderColor: focusedColors.borderColor },
            disabled && styles.fieldDisabled,
            fieldStyle,
          ]}
        >
          {fieldChildren}
          {shouldRenderDefaultPasswordToggle ? (
            <InputTrailing>
              <InputPasswordToggle />
            </InputTrailing>
          ) : null}
        </FastSquircleView>
        {messages}
      </View>
    </InputContext.Provider>
  );
});
