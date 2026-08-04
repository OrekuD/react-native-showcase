import { Text, type TextProps } from "react-native";

import { useButtonContext } from "./buttonShared";

export function ButtonLabel({ children, style, ...props }: TextProps) {
  const { color, label } = useButtonContext("Button.Label");

  return (
    <Text {...props} style={[{ color, ...label }, style]}>
      {children}
    </Text>
  );
}
