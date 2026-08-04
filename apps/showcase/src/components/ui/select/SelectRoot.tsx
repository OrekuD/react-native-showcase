import { MenuView } from "@expo/ui/community/menu";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { Children, Fragment, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { isSelectValueSelected, resolveSelectMode } from "./selectState";
import { resolveSelectTokens } from "./selectTheme";
import { SelectContent } from "./SelectContent";
import { SelectGroup } from "./SelectGroup";
import { SelectItem } from "./SelectItem";
import { useSelectTheme } from "./SelectThemeProvider";
import { getNativeActions, getOptionLabel } from "./selectHelpers";
import { SelectContext, type SelectContentProps, type SelectContextValue, type SelectGroupProps, type SelectItemProps, type SelectOption, type SelectProps } from "./selectShared";

function collectOptions(children: ReactNode, groupLabel?: string): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === SelectItem) {
      const props = child.props as SelectItemProps;
      return [{ disabled: props.disabled ?? false, groupLabel, label: getOptionLabel(props), value: props.value }];
    }
    if (child.type === SelectGroup) {
      const props = child.props as SelectGroupProps;
      return collectOptions(props.children, props.label);
    }
    if (child.type === SelectContent) {
      const props = child.props as SelectContentProps;
      return collectOptions(props.children, groupLabel);
    }
    if (child.type === Fragment) {
      return collectOptions((child.props as { children?: ReactNode }).children, groupLabel);
    }
    return [];
  });
}

export function SelectRoot(props: SelectProps) {
  const {
    children,
    defaultValue,
    disabled = false,
    mode: requestedMode,
    onValueChange,
    shouldOpenOnLongPress,
    testID,
    value: controlledValue,
  } = props;
  const customProps = props.mode === "native" ? undefined : props;
  const {
    defaultOpen,
    onOpenChange,
    open,
    theme: themeOverride,
  } = customProps ?? {};
  const mode = resolveSelectMode(requestedMode);
  const isNative = mode === "native";
  const inheritedTheme = useSelectTheme();
  const localTheme = isNative ? undefined : themeOverride;
  const theme = useMemo(() => resolveSelectTokens(inheritedTheme, localTheme), [inheritedTheme, localTheme]);
  const triggerRef = useRef<DropdownMenuPrimitive.TriggerRef>(null);
  const primitiveOpenRef = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(isNative ? false : defaultOpen ?? false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const options = useMemo(() => collectOptions(children), [children]);
  const selectedOption = useMemo(() => options.find((option) => isSelectValueSelected(value, option.value)), [options, value]);
  const requestedOpen = isNative ? false : open ?? uncontrolledOpen;
  const selectValue = useCallback((nextValue: string) => {
    if (controlledValue === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }, [controlledValue, onValueChange]);
  const handlePrimitiveOpenChange = useCallback((nextOpen: boolean) => {
    primitiveOpenRef.current = nextOpen;
    if (isNative) return;
    if (open === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [isNative, onOpenChange, open]);
  useEffect(() => {
    if (isNative) return;
    const trigger = triggerRef.current;
    if (!trigger || primitiveOpenRef.current === requestedOpen) return;
    if (requestedOpen) { trigger.open(); return; }
    trigger.close();
  }, [isNative, requestedOpen]);
  const context = useMemo<SelectContextValue>(() => ({
    disabled,
    mode,
    options,
    selectValue,
    selectedOption,
    shouldOpenOnLongPress: isNative ? false : shouldOpenOnLongPress ?? false,
    size: "default",
    testID,
    theme,
    triggerRef,
  }), [disabled, isNative, mode, options, selectValue, selectedOption, shouldOpenOnLongPress, testID, theme]);
  const nativeActions = useMemo(() => getNativeActions(options, value), [options, value]);
  const handleNativeAction = useCallback((nextValue: string) => {
    const option = options.find((item) => item.value === nextValue);
    if (option && !option.disabled) selectValue(nextValue);
  }, [options, selectValue]);
  if (props.mode === "native") {
    const { title } = props;
    const content = <SelectContext.Provider value={context}>{children}</SelectContext.Provider>;
    if (disabled) return content;
    return <MenuView actions={nativeActions} onPressAction={(event) => handleNativeAction(event.nativeEvent.event)} shouldOpenOnLongPress={shouldOpenOnLongPress} testID={testID} title={title}>{content}</MenuView>;
  }
  return <DropdownMenuPrimitive.Root onOpenChange={handlePrimitiveOpenChange}><SelectContext.Provider value={context}>{children}</SelectContext.Provider></DropdownMenuPrimitive.Root>;
}
