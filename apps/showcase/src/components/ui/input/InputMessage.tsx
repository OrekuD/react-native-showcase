import { Text } from "react-native";

import { resolveInputMessageTone } from "./inputState";
import { styles, type InputMessageProps, useInputContext } from "./inputShared";

export function InputMessage({ children, style, tone, ...props }: InputMessageProps) {
  const { colors, disabled, sizeTokens, status } = useInputContext("Input.Message");
  const resolvedTone = resolveInputMessageTone(status, tone);
  const color = disabled ? colors.disabled : resolvedTone === "error" ? colors.error : resolvedTone === "success" ? colors.success : colors.muted;

  return (
    <Text
      {...props}
      accessibilityRole={resolvedTone === "error" ? "alert" : undefined}
      style={[styles.message, { color, fontSize: sizeTokens.messageFontSize, lineHeight: sizeTokens.messageLineHeight }, style]}
    >
      {children}
    </Text>
  );
}
