import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { cloneElement, useCallback } from "react";
import { View } from "react-native";

import { type SelectTriggerProps, type TriggerChildProps, useSelectContext } from "./selectShared";

export function SelectTrigger({ children }: SelectTriggerProps) {
  const { disabled, mode, shouldOpenOnLongPress, testID, triggerRef } = useSelectContext("Select.Trigger");
  const trigger = cloneElement<TriggerChildProps>(children, { accessibilityRole: children.props.accessibilityRole ?? "button", disabled: Boolean(disabled || children.props.disabled) });
  const isDisabled = Boolean(disabled || children.props.disabled);
  const handleLongPress = useCallback((...args: Parameters<NonNullable<TriggerChildProps["onLongPress"]>>) => {
    if (isDisabled) return;
    triggerRef.current?.open();
    children.props.onLongPress?.(...args);
  }, [children.props.onLongPress, isDisabled, triggerRef]);
  if (mode === "native") return trigger;
  if (shouldOpenOnLongPress) return <DropdownMenuPrimitive.Trigger asChild disabled ref={triggerRef} testID={testID}><View accessible={false} collapsable={false}>{cloneElement(trigger, { onLongPress: handleLongPress })}</View></DropdownMenuPrimitive.Trigger>;
  return <DropdownMenuPrimitive.Trigger asChild disabled={disabled} ref={triggerRef} testID={testID}>{trigger}</DropdownMenuPrimitive.Trigger>;
}
