import { MenuView } from "@expo/ui/community/menu";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { resolveMenuMode } from "./menuState";
import { resolveMenuTokens } from "./menuTheme";
import { useMenuTheme } from "./MenuThemeProvider";
import { MenuContext, type MenuContextValue, type MenuProps } from "./menuShared";

export function MenuRoot(props: MenuProps) {
  const {
    children,
    mode: requestedMode,
    shouldOpenOnLongPress,
    testID,
  } = props;
  const customProps = props.mode === "native" ? undefined : props;
  const {
    defaultOpen,
    onOpenChange,
    open,
    theme: themeOverride,
  } = customProps ?? {};
  const mode = resolveMenuMode(requestedMode);
  const isNative = mode === "native";
  const inheritedTheme = useMenuTheme();
  const localTheme = isNative ? undefined : themeOverride;
  const theme = useMemo(() => resolveMenuTokens(inheritedTheme, localTheme), [inheritedTheme, localTheme]);
  const triggerRef = useRef<DropdownMenuPrimitive.TriggerRef>(null);
  const primitiveOpenRef = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(isNative ? false : defaultOpen ?? false);
  const requestedOpen = isNative ? false : open ?? uncontrolledOpen;
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
    if (requestedOpen) {
      trigger.open();
      return;
    }
    trigger.close();
  }, [isNative, requestedOpen]);
  const context = useMemo<MenuContextValue>(() => ({
    mode,
    shouldOpenOnLongPress: isNative ? false : shouldOpenOnLongPress ?? false,
    size: "default",
    testID,
    theme,
    triggerRef,
  }), [isNative, mode, shouldOpenOnLongPress, testID, theme]);

  if (props.mode === "native") {
    const { actions, onSelect, title } = props;

    return (
      <MenuContext.Provider value={context}>
        <MenuView actions={[...actions]} onPressAction={(event) => onSelect?.(event.nativeEvent.event)} shouldOpenOnLongPress={shouldOpenOnLongPress} testID={testID} title={title}>
          {children}
        </MenuView>
      </MenuContext.Provider>
    );
  }
  return (
    <DropdownMenuPrimitive.Root onOpenChange={handlePrimitiveOpenChange}>
      <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
    </DropdownMenuPrimitive.Root>
  );
}
