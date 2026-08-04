import { ActivityIndicator, View } from "react-native";
import Animated from "react-native-reanimated";

import {
  ICON_ENTERING,
  ICON_EXITING,
  styles,
  type ButtonIconProps,
  useButtonContext,
} from "./buttonShared";

export function ButtonIcon({ children, style, ...props }: ButtonIconProps) {
  const { color, loading, size } = useButtonContext("Button.Icon");
  const icon =
    typeof children === "function" ? children({ color, size }) : children;

  return (
    <View
      {...props}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[style, styles.iconSlot, { height: size, width: size }]}
    >
      <Animated.View
        entering={ICON_ENTERING}
        exiting={ICON_EXITING}
        key={loading ? "loading" : "icon"}
        style={styles.iconLayer}
      >
        {loading ? <ActivityIndicator color={color} size="small" /> : icon}
      </Animated.View>
    </View>
  );
}
