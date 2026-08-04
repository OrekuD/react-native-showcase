import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { useCallback } from "react";
import { Text, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { isSelectValueSelected } from "./selectState";
import { getOptionLabel } from "./selectHelpers";
import { AnimatedSelectItem, EASE_OUT, SELECT_ITEM_PRESSED_SCALE, SELECT_ITEM_PRESS_IN_DURATION_MS, SELECT_ITEM_PRESS_OUT_DURATION_MS, styles, type SelectItemProps, useSelectContext } from "./selectShared";

export function SelectItem({ children, description, disabled = false, haptics = false, icon, label, value }: SelectItemProps) {
  const { selectedOption, size, theme } = useSelectContext("Select.Item");
  const isCompact = size === "compact";
  const isSelected = isSelectValueSelected(selectedOption?.value, value);
  const pressedScale = useSharedValue(1);
  const textValue = label ?? getOptionLabel({ children, label });
  const animatedPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressedScale.value }] }));
  const handlePressIn = useCallback(() => { pressedScale.value = withTiming(SELECT_ITEM_PRESSED_SCALE, { duration: SELECT_ITEM_PRESS_IN_DURATION_MS, easing: EASE_OUT, reduceMotion: ReduceMotion.System }); }, [pressedScale]);
  const handlePressOut = useCallback(() => { pressedScale.value = withTiming(1, { duration: SELECT_ITEM_PRESS_OUT_DURATION_MS, easing: EASE_OUT, reduceMotion: ReduceMotion.System }); }, [pressedScale]);
  const handlePress = useCallback(() => { if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [haptics]);
  return (
    <DropdownMenuPrimitive.RadioItem asChild disabled={disabled} textValue={textValue} value={value}>
      <AnimatedSelectItem onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.item, isCompact && styles.itemCompact, disabled && styles.itemDisabled, animatedPressStyle]}>
        {icon ? <FastSquircleView cornerSmoothing={1} style={[styles.iconContainer, isCompact && styles.iconContainerCompact, { backgroundColor: theme.iconBackgroundColor }]}><View style={isCompact && styles.iconCompact}>{icon}</View></FastSquircleView> : null}
        <View style={[styles.itemCopy, isCompact && styles.itemCopyCompact]}><Text style={[styles.itemLabel, isCompact && styles.itemLabelCompact, { color: theme.labelColor }]}>{children}</Text>{description ? <Text style={[styles.itemDescription, isCompact && styles.itemDescriptionCompact, { color: theme.descriptionColor }]}>{description}</Text> : null}</View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.checkmark, isCompact && styles.checkmarkCompact]}>{isSelected ? <Check color={theme.checkmarkColor} size={20} strokeWidth={2.6} /> : null}</View>
      </AnimatedSelectItem>
    </DropdownMenuPrimitive.RadioItem>
  );
}
