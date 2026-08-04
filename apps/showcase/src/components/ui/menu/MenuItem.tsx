import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Text, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { AnimatedMenuItem, EASE_OUT, MENU_ITEM_PRESSED_SCALE, MENU_ITEM_PRESS_IN_DURATION_MS, MENU_ITEM_PRESS_OUT_DURATION_MS, styles, type MenuItemProps, useMenuContext } from "./menuShared";

export function MenuItem({ children, description, destructive = false, disabled = false, haptics = false, icon, onSelect }: MenuItemProps) {
  const { size, theme } = useMenuContext("Menu.Item");
  const isCompact = size === "compact";
  const pressedScale = useSharedValue(1);
  const textValue = typeof children === "string" || typeof children === "number" ? String(children) : undefined;
  const animatedPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressedScale.value }] }));
  const handlePressIn = useCallback(() => { pressedScale.value = withTiming(MENU_ITEM_PRESSED_SCALE, { duration: MENU_ITEM_PRESS_IN_DURATION_MS, easing: EASE_OUT, reduceMotion: ReduceMotion.System }); }, [pressedScale]);
  const handlePressOut = useCallback(() => { pressedScale.value = withTiming(1, { duration: MENU_ITEM_PRESS_OUT_DURATION_MS, easing: EASE_OUT, reduceMotion: ReduceMotion.System }); }, [pressedScale]);
  const handlePress = useCallback(() => { if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect?.(); }, [haptics, onSelect]);
  return (
    <DropdownMenuPrimitive.Item asChild disabled={disabled} textValue={textValue}>
      <AnimatedMenuItem onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.item, isCompact && styles.itemCompact, disabled && styles.itemDisabled, animatedPressStyle]}>
        {icon ? <FastSquircleView cornerSmoothing={1} style={[styles.iconContainer, isCompact && styles.iconContainerCompact, { backgroundColor: theme.iconBackgroundColor }]}><View style={isCompact && styles.iconCompact}>{icon}</View></FastSquircleView> : null}
        <View style={[styles.itemCopy, isCompact && styles.itemCopyCompact]}>
          <Text style={[styles.itemLabel, isCompact && styles.itemLabelCompact, { color: destructive ? theme.destructiveLabelColor : theme.labelColor }]}>{children}</Text>
          {description ? <Text style={[styles.itemDescription, isCompact && styles.itemDescriptionCompact, { color: destructive ? theme.destructiveDescriptionColor : theme.descriptionColor }]}>{description}</Text> : null}
        </View>
      </AnimatedMenuItem>
    </DropdownMenuPrimitive.Item>
  );
}
