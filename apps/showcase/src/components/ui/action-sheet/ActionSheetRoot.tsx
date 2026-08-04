import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Platform } from "react-native";

import {
  createNativeActionSheetOptions,
  resolveActionSheetMode,
  validateActionSheetActions,
} from "./actionSheetState";
import { useActionSheetTheme } from "./ActionSheetThemeProvider";
import {
  ActionSheetContext,
  type ActionSheetAction,
  type ActionSheetContextValue,
  type ActionSheetProps,
} from "./actionSheetShared";

export function ActionSheetRoot({
  actions,
  cancelLabel = "Cancel",
  children,
  defaultOpen = false,
  dismissible = true,
  haptics = false,
  message,
  mode: requestedMode,
  onCancel,
  onOpenChange,
  onSelect,
  open,
  testID,
  title,
}: ActionSheetProps) {
  const mode = resolveActionSheetMode(requestedMode, Platform.OS);
  const theme = useActionSheetTheme();
  const sheetRef = useRef<TrueSheet>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const requestedOpen = open ?? uncontrolledOpen;
  const nativeVisibleRef = useRef(false);
  const dismissReasonRef = useRef<"programmatic" | "selection" | null>(null);
  const previousRequestedOpenRef = useRef(false);

  validateActionSheetActions(actions);

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open]
  );

  const selectAction = useCallback(
    (action: ActionSheetAction) => {
      if (action.disabled) return;
      action.onPress?.();
      onSelect?.(action);
    },
    [onSelect]
  );

  const showNativeSheet = useCallback(() => {
    if (nativeVisibleRef.current) return;
    const nativeOptions = createNativeActionSheetOptions({
      actions,
      cancelLabel,
      message,
      title,
    });
    nativeVisibleRef.current = true;
    onOpenChange?.(true);

    ActionSheetIOS.showActionSheetWithOptions(
      nativeOptions,
      (buttonIndex) => {
        nativeVisibleRef.current = false;
        onOpenChange?.(false);
        if (buttonIndex === nativeOptions.cancelButtonIndex) {
          onCancel?.();
          return;
        }
        const action = actions[buttonIndex];
        if (action) selectAction(action);
      }
    );
  }, [actions, cancelLabel, message, onCancel, onOpenChange, selectAction, title]);

  const openSheet = useCallback(() => {
    if (mode === "native") {
      showNativeSheet();
      return;
    }
    dismissReasonRef.current = null;
    setOpenState(true);
  }, [mode, setOpenState, showNativeSheet]);

  const onCustomDismiss = useCallback(
    (cancelled: boolean) => {
      previousRequestedOpenRef.current = false;
      setOpenState(false);
      if (cancelled) onCancel?.();
    },
    [onCancel, setOpenState]
  );

  useEffect(() => {
    if (mode !== "custom" || previousRequestedOpenRef.current === requestedOpen) {
      return;
    }
    previousRequestedOpenRef.current = requestedOpen;
    if (requestedOpen) {
      void sheetRef.current?.present();
      return;
    }
    if (dismissReasonRef.current === null) {
      dismissReasonRef.current = "programmatic";
    }
    void sheetRef.current?.dismiss();
  }, [mode, requestedOpen]);

  const context = useMemo<ActionSheetContextValue>(
    () => ({
      actions,
      dismissible,
      dismissReasonRef,
      haptics,
      message,
      mode,
      onCustomDismiss,
      openSheet,
      selectAction,
      sheetRef,
      testID,
      theme,
      title,
    }),
    [actions, dismissible, haptics, message, mode, onCustomDismiss, openSheet, selectAction, testID, theme, title]
  );

  return (
    <ActionSheetContext.Provider value={context}>
      {children}
    </ActionSheetContext.Provider>
  );
}
