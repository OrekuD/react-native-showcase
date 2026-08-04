import { View } from "react-native";
import Animated from "react-native-reanimated";

import { ICON_ENTERING, ICON_EXITING, styles, type InputIconProps, useInputContext } from "./inputShared";

export function InputIcon({ animationKey, children, style, ...props }: InputIconProps) {
  const { iconColor, sizeTokens, status } = useInputContext("Input.Icon");
  const iconSize = sizeTokens.iconSize;
  const icon = typeof children === "function" ? children({ color: iconColor, size: iconSize }) : children;

  return (
    <View {...props} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.icon, { height: iconSize, width: iconSize }, style]}>
      <Animated.View entering={ICON_ENTERING} exiting={ICON_EXITING} key={animationKey ?? status} style={styles.iconLayer}>
        {icon}
      </Animated.View>
    </View>
  );
}
