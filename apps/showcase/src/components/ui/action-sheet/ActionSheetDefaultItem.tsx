import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { ActionSheetAction } from "./actionSheetShared";
import type { ResolvedActionSheetTheme } from "./actionSheetTheme";

type ActionSheetDefaultItemProps = {
  action: ActionSheetAction;
  haptics: boolean;
  itemCornerSmoothing: number;
  itemLabelStyle?: StyleProp<TextStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
  theme: ResolvedActionSheetTheme;
};

const AnimatedSquircleView = Animated.createAnimatedComponent(FastSquircleView);
const PRESS_IN_DURATION_MS = 100;
const PRESS_OUT_DURATION_MS = 130;
const PRESSED_SCALE = 0.97;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export function ActionSheetDefaultItem({
  action,
  haptics,
  itemCornerSmoothing,
  itemLabelStyle,
  itemStyle,
  onPress,
  theme,
}: ActionSheetDefaultItemProps) {
  const pressedScale = useSharedValue(1);
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
  }));
  const handlePressIn = useCallback(() => {
    pressedScale.value = withTiming(PRESSED_SCALE, {
      duration: PRESS_IN_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePressOut = useCallback(() => {
    pressedScale.value = withTiming(1, {
      duration: PRESS_OUT_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePress = useCallback(() => {
    if (haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [haptics, onPress]);
  const labelColor = action.destructive
    ? theme.destructiveLabelColor
    : theme.labelColor;

  return (
    <AnimatedSquircleView
      cornerSmoothing={itemCornerSmoothing}
      style={[
        styles.item,
        {
          backgroundColor: theme.itemBackgroundColor,
          borderRadius: theme.itemBorderRadius,
          minHeight: theme.itemMinHeight,
          opacity: action.disabled ? 0.42 : 1,
          paddingHorizontal: theme.itemPaddingHorizontal,
          paddingVertical: theme.itemPaddingVertical,
        },
        itemStyle,
        animatedPressStyle,
      ]}
    >
      <Pressable
        accessibilityLabel={action.accessibilityLabel ?? action.label}
        accessibilityRole="button"
        accessibilityState={{ disabled: action.disabled }}
        disabled={action.disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.pressable, { gap: theme.itemGap }]}
      >
        {action.icon ? (
          <FastSquircleView
            cornerSmoothing={1}
            style={{
              alignItems: "center",
              backgroundColor: theme.iconBackgroundColor,
              borderRadius: theme.iconContainerSize / 2,
              height: theme.iconContainerSize,
              justifyContent: "center",
              width: theme.iconContainerSize,
            }}
          >
            {action.icon({
              color: action.destructive
                ? theme.destructiveLabelColor
                : theme.iconColor,
              size: theme.iconSize,
            })}
          </FastSquircleView>
        ) : null}
        <View style={styles.copy}>
          <Text
            style={[
              {
                color: labelColor,
                fontSize: theme.labelFontSize,
                fontWeight: action.destructive ? "600" : "500",
                letterSpacing: -0.15,
                textAlign: theme.textAlign,
              },
              itemLabelStyle,
            ]}
          >
            {action.label}
          </Text>
          {action.description ? (
            <Text
              style={[
                styles.description,
                {
                  color: theme.descriptionColor,
                  textAlign: theme.textAlign,
                },
              ]}
            >
              {action.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </AnimatedSquircleView>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1, gap: 1 },
  description: { fontSize: 12, lineHeight: 16 },
  item: { overflow: "hidden" },
  pressable: { alignItems: "center", flex: 1, flexDirection: "row" },
});
