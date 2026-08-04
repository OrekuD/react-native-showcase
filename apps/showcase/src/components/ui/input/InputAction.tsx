import { Pressable } from "react-native";

import { styles, type InputActionProps, useInputContext } from "./inputShared";

export function InputAction({ children, disabled, style, ...props }: InputActionProps) {
  const context = useInputContext("Input.Action");
  const actionSize = context.sizeTokens.actionSize;

  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      disabled={context.disabled || disabled}
      style={(state) => [
        styles.action,
        { height: actionSize, minWidth: actionSize },
        context.disabled && styles.actionDisabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}
