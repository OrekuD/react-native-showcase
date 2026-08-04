import { View } from "react-native";

import { styles, type InputTrailingProps, useInputContext } from "./inputShared";

export function InputTrailing({ children, style, ...props }: InputTrailingProps) {
  const { sizeTokens } = useInputContext("Input.Trailing");

  return (
    <View {...props} pointerEvents="box-none" style={[styles.trailing, { minWidth: sizeTokens.trailingWidth }, style]}>
      {children}
    </View>
  );
}
