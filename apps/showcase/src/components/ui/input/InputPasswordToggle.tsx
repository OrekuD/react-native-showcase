import { View, type PressableProps } from "react-native";
import { Eye, EyeOff, type LucideProps } from "lucide-react-native";
import Animated from "react-native-reanimated";

import { InputAction } from "./InputAction";
import { ICON_ENTERING, ICON_EXITING, styles, type InputPasswordToggleProps, useInputContext } from "./inputShared";

export function InputPasswordToggle({ children, ...props }: InputPasswordToggleProps) {
  const { iconColor, secureEntry, secureVisible, sizeTokens, toggleSecureEntry } = useInputContext("Input.PasswordToggle");
  const iconSize = sizeTokens.iconSize;
  if (!secureEntry) {
    throw new Error("Input.PasswordToggle requires secureEntry on Input.");
  }
  const iconProps: LucideProps = { color: iconColor, size: iconSize, strokeWidth: 2 };
  const icon = typeof children === "function" ? children({ color: iconColor, size: iconSize, visible: secureVisible }) : children;
  const handlePress: NonNullable<PressableProps["onPress"]> = (event) => {
    toggleSecureEntry();
    props.onPress?.(event);
  };

  return (
    <InputAction {...props} accessibilityLabel={props.accessibilityLabel ?? (secureVisible ? "Hide password" : "Show password")} onPress={handlePress}>
      <View style={[styles.passwordIcon, { height: iconSize, width: iconSize }]}>
        <Animated.View entering={ICON_ENTERING} exiting={ICON_EXITING} key={secureVisible ? (children ? "visible-custom" : "visible") : children ? "hidden-custom" : "hidden"} style={styles.iconLayer}>
          {children ? icon : secureVisible ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
        </Animated.View>
      </View>
    </InputAction>
  );
}
