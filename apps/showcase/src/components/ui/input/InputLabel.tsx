import { Text } from "react-native";

import { resolveInputExternalLabelOffset } from "./inputState";
import { appearanceSuffix, styles, type InputLabelProps, useInputContext } from "./inputShared";

export function InputLabel({ children, required = false, style, ...props }: InputLabelProps) {
  const { appearance, colors, disabled, focusColor, focused, iconColor, labelBackgroundColor, sizeTokens, status } = useInputContext("Input.Label");
  const isInsetLabel = appearance === "filled" || appearance === "stacked";
  const color = disabled ? colors.disabled : status === "error" ? colors.error : status === "success" ? colors.success : focused ? focusColor : iconColor;
  const labelBackground = appearance === "notched" ? labelBackgroundColor : "transparent";
  const externalLabelOffset = resolveInputExternalLabelOffset(sizeTokens.labelLineHeight);

  return (
    <Text
      {...props}
      style={[
        styles.label,
        styles[`label${appearanceSuffix(appearance)}`],
        {
          backgroundColor: labelBackground,
          color,
          fontSize: sizeTokens.labelFontSize,
          left: isInsetLabel ? sizeTokens.insetLabelLeft : appearance === "notched" ? sizeTokens.notchedLabelLeft : sizeTokens.externalLabelLeft,
          lineHeight: sizeTokens.labelLineHeight,
          paddingHorizontal: appearance === "notched" ? sizeTokens.borderLabelPadding : 0,
          top: isInsetLabel ? sizeTokens.insetLabelTop : appearance === "notched" ? sizeTokens.borderLabelTop : -externalLabelOffset,
        },
        style,
      ]}
    >
      {children}
      {required ? <Text style={{ color }}> *</Text> : null}
    </Text>
  );
}
