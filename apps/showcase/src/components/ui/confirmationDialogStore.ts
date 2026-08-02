import type { AlertButton } from "react-native";

import {
  getConfirmationDialogButtons,
  type ConfirmationDialogOptions,
} from "./confirmationDialogState";

export type ConfirmationDialogRequest = Omit<
  ConfirmationDialogOptions,
  "buttons"
> & {
  buttons: AlertButton[];
  id: number;
};

type ConfirmationDialogListener = (request: ConfirmationDialogRequest) => void;

let confirmationDialogRequestId = 0;
let confirmationDialogListener: ConfirmationDialogListener | undefined;

export function showCustomConfirmationDialog(
  options: ConfirmationDialogOptions
): void {
  confirmationDialogRequestId += 1;
  confirmationDialogListener?.({
    ...options,
    buttons: getConfirmationDialogButtons(options),
    id: confirmationDialogRequestId,
  });
}

export function registerConfirmationDialogListener(
  listener: ConfirmationDialogListener
): () => void {
  confirmationDialogListener = listener;

  return () => {
    if (confirmationDialogListener === listener) {
      confirmationDialogListener = undefined;
    }
  };
}
