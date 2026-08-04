import { Alert, type AlertButton } from "react-native";

import { ConfirmationDialogRoot } from "./ConfirmationDialog";
import {
  getConfirmationDialogAlertOptions,
  getConfirmationDialogButtons,
  resolveConfirmationDialogMode,
  type ConfirmationDialogAlertOptions,
  type ConfirmationDialogOptions,
} from "./confirmationDialogState";
import { showCustomConfirmationDialog } from "./confirmationDialogStore";

function showNativeConfirmationDialog(options: ConfirmationDialogOptions): void {
  Alert.alert(
    options.title,
    options.description,
    getConfirmationDialogButtons(options),
    getConfirmationDialogAlertOptions(options)
  );
}

/** Imperative extensions for the controlled {@link ConfirmationDialogRoot}. */
export const ConfirmationDialog = Object.assign(ConfirmationDialogRoot, {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: ConfirmationDialogAlertOptions
  ): void {
    const request: ConfirmationDialogOptions = {
      buttons,
      cancelable: options?.cancelable,
      description: message,
      mode: options?.mode,
      onCancel: options?.onDismiss,
      title,
    };

    if (resolveConfirmationDialogMode(options?.mode) === "native") {
      Alert.alert(title, message, buttons, options);
      return;
    }

    showCustomConfirmationDialog(request);
  },
  show(options: ConfirmationDialogOptions): void {
    if (resolveConfirmationDialogMode(options.mode) === "native") {
      showNativeConfirmationDialog(options);
      return;
    }

    showCustomConfirmationDialog(options);
  },
});
