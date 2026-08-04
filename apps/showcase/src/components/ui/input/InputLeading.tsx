import { View } from "react-native";

import { styles, type InputLeadingProps, useInputContext } from "./inputShared";

export function InputLeading({ children, style, ...props }: InputLeadingProps) {
  const { sizeTokens } = useInputContext("Input.Leading");

  return (
    <View {...props} pointerEvents="box-none" style={[styles.leading, { minWidth: sizeTokens.trailingWidth }, style]}>
      {children}
    </View>
  );
}
