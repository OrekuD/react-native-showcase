import { forwardRef, useCallback, useRef, useState } from "react";
import { CircleX } from "lucide-react-native";
import { TextInput as NativeTextInput, type TextInputProps as NativeTextInputProps } from "react-native";

import { hasInputContent, resolveInputHorizontalInsets } from "./inputState";
import { InputAction } from "./InputAction";
import { InputIcon } from "./InputIcon";
import { InputTrailing } from "./InputTrailing";
import { appearanceSuffix, assignRef, styles, type InputControlProps, useInputContext } from "./inputShared";

export const InputControl = forwardRef<NativeTextInput, InputControlProps>(function InputControl(
  { accessibilityLabel, clearable = false, defaultValue, editable, onBlur, onFocus, onChangeText, placeholderTextColor, secureTextEntry, selectionColor, style, value, ...props },
  ref
) {
  const { accessibilityLabel: rootAccessibilityLabel, appearance, colors, disabled, fieldBackgroundColor, focusColor, hasCustomTrailing, hasLabel, hasLeading, hasTrailing, iconColor, secureEntry, secureVisible, sizeTokens, setFocused } = useInputContext("Input.Control");
  const nativeInputRef = useRef<NativeTextInput>(null);
  const [uncontrolledHasContent, setUncontrolledHasContent] = useState(() => hasInputContent(defaultValue));
  const hasContent = value === undefined ? uncontrolledHasContent : hasInputContent(value);
  const supportsClearAction = clearable && !secureEntry && !hasCustomTrailing;
  const showsClearAction = supportsClearAction && hasContent;
  const clearIconColor = fieldBackgroundColor;
  const horizontalInsets = resolveInputHorizontalInsets({
    basePadding: sizeTokens.controlHorizontalPadding[appearance],
    hasLeading,
    hasTrailing,
    leadingPadding: sizeTokens.controlLeadingPadding,
    trailingPadding: sizeTokens.controlTrailingPadding,
  });
  const setNativeInputRef = useCallback((node: NativeTextInput | null) => {
    nativeInputRef.current = node;
    assignRef(ref, node);
  }, [ref]);
  const handleFocus = useCallback((event: Parameters<NonNullable<NativeTextInputProps["onFocus"]>>[0]) => {
    setFocused(true);
    onFocus?.(event);
  }, [onFocus, setFocused]);
  const handleBlur = useCallback((event: Parameters<NonNullable<NativeTextInputProps["onBlur"]>>[0]) => {
    setFocused(false);
    onBlur?.(event);
  }, [onBlur, setFocused]);
  const handleChangeText = useCallback((text: string) => {
    if (value === undefined) {
      setUncontrolledHasContent(hasInputContent(text));
    }
    onChangeText?.(text);
  }, [onChangeText, value]);
  const handleClear = useCallback(() => {
    nativeInputRef.current?.clear();
    setUncontrolledHasContent(false);
    onChangeText?.("");
    nativeInputRef.current?.focus();
  }, [onChangeText]);

  return (
    <>
      <NativeTextInput
        {...props}
        accessibilityLabel={accessibilityLabel ?? rootAccessibilityLabel}
        defaultValue={defaultValue}
        editable={disabled ? false : editable}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        placeholderTextColor={placeholderTextColor ?? colors.muted}
        ref={setNativeInputRef}
        secureTextEntry={secureEntry ? !secureVisible : secureTextEntry}
        selectionColor={selectionColor ?? focusColor}
        style={[
          styles.control,
          styles[`control${appearanceSuffix(appearance)}`],
          hasLabel && appearance === "filled" && styles.controlFilledWithLabel,
          hasTrailing && styles.controlWithTrailing,
          {
            color: disabled ? colors.disabled : colors.text,
            fontSize: sizeTokens.controlFontSize,
            minHeight: sizeTokens.fieldHeight,
            paddingBottom: sizeTokens.controlPaddingBottom,
            ...horizontalInsets,
            paddingTop: hasLabel ? sizeTokens.controlPaddingTopWithLabel[appearance] : sizeTokens.controlPaddingTop[appearance],
          },
          style,
        ]}
        value={value}
      />
      {supportsClearAction ? (
        <InputTrailing>
          <InputAction accessibilityElementsHidden={!showsClearAction} accessibilityLabel="Clear input" disabled={!showsClearAction} onPress={handleClear} pointerEvents={showsClearAction ? "auto" : "none"}>
            <InputIcon animationKey={showsClearAction ? "clear-visible" : "clear-hidden"}>
              {showsClearAction ? <CircleX color={clearIconColor} fill={iconColor} size={sizeTokens.iconSize} strokeWidth={2.4} /> : null}
            </InputIcon>
          </InputAction>
        </InputTrailing>
      ) : null}
    </>
  );
});
