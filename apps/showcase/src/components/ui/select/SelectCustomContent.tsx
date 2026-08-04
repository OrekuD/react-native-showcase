import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated from "react-native-reanimated";

import { resolvePopoverSide } from "../popoverPosition";
import { createOutsetShadow } from "../outsetShadow";
import { CONTENT_EDGE_INSET, CONTENT_ENTERING, CONTENT_EXITING, SelectContext, styles, type SelectContentProps, type SelectContextValue } from "./selectShared";

type SelectCustomContentProps = Omit<SelectContentProps, "align" | "sideOffset" | "size"> & { align: NonNullable<SelectContentProps["align"]>; context: SelectContextValue; sideOffset: number; size: NonNullable<SelectContentProps["size"]> };

export function SelectCustomContent({ align, children, context, sideOffset, size }: SelectCustomContentProps) {
  const { selectValue, selectedOption, theme } = context;
  const { contentLayout, triggerPosition } = DropdownMenuPrimitive.useRootContext();
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const side = resolvePopoverSide({ contentHeight: contentLayout?.height, insetBottom: CONTENT_EDGE_INSET, insetTop: CONTENT_EDGE_INSET, triggerHeight: triggerPosition?.height, triggerY: triggerPosition?.pageY, viewportHeight });
  const contentContext = useMemo<SelectContextValue>(() => ({ ...context, size }), [context, size]);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Overlay asChild><Pressable accessibilityLabel="Dismiss select" accessibilityRole="button" style={StyleSheet.absoluteFill} /></DropdownMenuPrimitive.Overlay>
      <DropdownMenuPrimitive.Content align={align} avoidCollisions insets={{ bottom: CONTENT_EDGE_INSET, left: CONTENT_EDGE_INSET, right: CONTENT_EDGE_INSET, top: CONTENT_EDGE_INSET }} side={side} sideOffset={sideOffset}>
        <Animated.View entering={CONTENT_ENTERING} exiting={CONTENT_EXITING}>
          <FastSquircleView cornerSmoothing={theme.cornerSmoothing} style={[styles.panel, size === "compact" && styles.panelCompact, { borderRadius: theme.borderRadius, width: Math.min(320, Math.max(0, viewportWidth - 32)) }, createOutsetShadow({ blurRadius: 24, color: theme.shadowColor, elevation: 10, offsetY: 16, opacity: 0.14 })]}>
            <View pointerEvents="none" style={[styles.panelSurface, { backgroundColor: theme.backgroundColor }]} />
            <View pointerEvents="none" style={[styles.panelChrome, { borderColor: theme.borderColor, borderRadius: theme.borderRadius }]} />
            <SelectContext.Provider value={contentContext}><DropdownMenuPrimitive.RadioGroup asChild onValueChange={selectValue} value={selectedOption?.value}><View style={[styles.content, size === "compact" && styles.contentCompact]}>{children}</View></DropdownMenuPrimitive.RadioGroup></SelectContext.Provider>
          </FastSquircleView>
        </Animated.View>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}
