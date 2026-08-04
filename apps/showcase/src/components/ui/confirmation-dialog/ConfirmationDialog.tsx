import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, View, type AlertButton } from "react-native";

import { ConfirmationDialogOverlay } from "./ConfirmationDialogOverlay";
import {
  getConfirmationDialogAlertOptions,
  getConfirmationDialogButtons,
  resolveConfirmationDialogMode,
  type ConfirmationDialogAlertOptions,
  type ConfirmationDialogOptions,
} from "./confirmationDialogState";
import {
  registerConfirmationDialogListener,
  type ConfirmationDialogRequest,
} from "./confirmationDialogStore";

export type {
  ConfirmationDialogAlertOptions,
  ConfirmationDialogMode,
  ConfirmationDialogOptions,
  ConfirmationDialogVariant,
} from "./confirmationDialogState";

/** Controlled props accepted by the {@link ConfirmationDialog} component. */
export type ConfirmationDialogProps = ConfirmationDialogOptions & {
  /** Controls whether the dialog is presented. */
  open: boolean;
  /** Receives dismissal requests from every custom dialog exit path. */
  onOpenChange?: (open: boolean) => void;
};

const IMPERATIVE_PORTAL_NAME = "showcase-confirmation-dialog";

function dismissWithCallback(
  onCancel: (() => void) | undefined,
  onOpenChange: ((open: boolean) => void) | undefined
) {
  onCancel?.();
  onOpenChange?.(false);
}

function selectWithCallback(
  button: AlertButton,
  onOpenChange: ((open: boolean) => void) | undefined
) {
  button.onPress?.();
  onOpenChange?.(false);
}

export function ConfirmationDialogRoot({
  buttons,
  cancelLabel,
  cancelable,
  confirmLabel,
  destructive,
  description,
  dismissible,
  mode = "custom",
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  title,
  variant,
}: ConfirmationDialogProps) {
  const portalName = `showcase-confirmation-${useId()}`;
  const wasNativeDialogOpen = useRef(false);
  const requestOptions = useMemo<ConfirmationDialogOptions>(
    () => ({
      buttons,
      cancelLabel,
      cancelable,
      confirmLabel,
      destructive,
      description,
      dismissible,
      mode,
      onCancel,
      onConfirm,
      title,
      variant,
    }),
    [
      buttons,
      cancelLabel,
      cancelable,
      confirmLabel,
      destructive,
      description,
      dismissible,
      mode,
      onCancel,
      onConfirm,
      title,
      variant,
    ]
  );
  const request = useMemo<ConfirmationDialogRequest>(
    () => ({
      ...requestOptions,
      buttons: getConfirmationDialogButtons(requestOptions),
      id: 0,
    }),
    [requestOptions]
  );
  const handleDismiss = useCallback(
    () => dismissWithCallback(onCancel, onOpenChange),
    [onCancel, onOpenChange]
  );
  const handleSelect = useCallback(
    (button: AlertButton) => selectWithCallback(button, onOpenChange),
    [onOpenChange]
  );

  useEffect(() => {
    if (mode !== "native" || !open) {
      wasNativeDialogOpen.current = false;
      return;
    }

    if (wasNativeDialogOpen.current) return;

    wasNativeDialogOpen.current = true;
    Alert.alert(
      title,
      description,
      request.buttons.map((button) => ({
        ...button,
        onPress: () => handleSelect(button),
      })),
      {
        ...getConfirmationDialogAlertOptions(requestOptions),
        onDismiss: handleDismiss,
      }
    );
  }, [
    description,
    handleDismiss,
    handleSelect,
    mode,
    open,
    request.buttons,
    requestOptions,
    title,
  ]);

  if (!open || resolveConfirmationDialogMode(mode) === "native") {
    return null;
  }

  return (
    <ConfirmationDialogOverlay
      onDismiss={handleDismiss}
      onSelect={handleSelect}
      portalName={portalName}
      request={request}
    />
  );
}

/**
 * Mount once near the root of the app to enable the custom dialog surface and
 * {@link ConfirmationDialog.show}.
 */
export function ConfirmationDialogHost() {
  const [request, setRequest] = useState<ConfirmationDialogRequest | null>(
    null
  );

  useEffect(
    () =>
      registerConfirmationDialogListener((nextRequest) =>
        setRequest(nextRequest)
      ),
    []
  );

  const handleDismiss = useCallback(() => {
    const currentRequest = request;

    setRequest(null);
    currentRequest?.onCancel?.();
  }, [request]);
  const handleSelect = useCallback((button: AlertButton) => {
    setRequest(null);
    button.onPress?.();
  }, []);

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {request ? (
        <ConfirmationDialogOverlay
          key={request.id}
          onDismiss={handleDismiss}
          onSelect={handleSelect}
          portalName={IMPERATIVE_PORTAL_NAME}
          request={request}
        />
      ) : null}
    </View>
  );
}

/**
 * A source-first confirmation dialog with an Alert-like imperative API and a
 * controlled component form. Custom UI is used by default; choose
 * `mode="native"` for the platform alert.
 */
const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
});
