import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { cloneElement, useCallback } from "react";
import { View } from "react-native";

import { type MenuTriggerProps, type TriggerChildProps, useMenuContext } from "./menuShared";

export function MenuTrigger({ children }: MenuTriggerProps) {
  const { mode, shouldOpenOnLongPress, testID, triggerRef } = useMenuContext("Menu.Trigger");
  const isDisabled = Boolean(children.props.disabled);
  const trigger = cloneElement<TriggerChildProps>(children, { accessibilityRole: children.props.accessibilityRole ?? "button" });
  const handleLongPress = useCallback((...args: Parameters<NonNullable<TriggerChildProps["onLongPress"]>>) => {
    if (isDisabled) return;
    triggerRef.current?.open();
    children.props.onLongPress?.(...args);
  }, [children.props.onLongPress, isDisabled, triggerRef]);
  if (mode === "native") return trigger;
  if (shouldOpenOnLongPress) {
    return (
      <DropdownMenuPrimitive.Trigger asChild disabled ref={triggerRef} testID={testID}>
        <View accessible={false} collapsable={false}>{cloneElement(trigger, { onLongPress: handleLongPress })}</View>
      </DropdownMenuPrimitive.Trigger>
    );
  }
  return <DropdownMenuPrimitive.Trigger asChild ref={triggerRef} testID={testID}>{trigger}</DropdownMenuPrimitive.Trigger>;
}
