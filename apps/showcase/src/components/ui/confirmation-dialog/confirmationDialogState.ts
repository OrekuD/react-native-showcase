import type { AlertButton, AlertOptions } from "react-native";

/** Selects the platform alert or Showcase's custom dialog surface. */
export type ConfirmationDialogMode = "custom" | "native";

/** Visual treatments available when {@link ConfirmationDialogMode} is `custom`. */
export type ConfirmationDialogVariant =
  | "action-sheet"
  | "compact"
  | "prominent";

/** Native alert options with an explicit opt-in to the platform alert. */
export type ConfirmationDialogAlertOptions = AlertOptions & {
  /** Selects the custom surface or React Native's native platform alert. @default 'custom' */
  mode?: ConfirmationDialogMode;
};

/** Options shared by the imperative and controlled dialog APIs. */
export type ConfirmationDialogOptions = {
  /** Optional custom actions. When omitted, confirmation actions are derived from the labels below. */
  buttons?: AlertButton[];
  /** Shows a tappable cancel action when supplied. */
  cancelLabel?: string;
  /** Whether the backdrop and Android back button can dismiss the dialog. @default true */
  cancelable?: boolean;
  /** Label for the primary action. @default 'OK' */
  confirmLabel?: string;
  /** Makes the derived confirmation action destructive. @default false */
  destructive?: boolean;
  /** Supporting text displayed below the title. */
  description?: string;
  /** Renders a close button for the compact and prominent custom variants. @default false */
  dismissible?: boolean;
  /** Selects the custom surface or React Native's native platform alert. @default 'custom' */
  mode?: ConfirmationDialogMode;
  /** Runs after a cancel action, backdrop press, or Android back dismissal. */
  onCancel?: () => void;
  /** Runs after the derived confirmation action is pressed. */
  onConfirm?: () => void;
  /** The dialog heading. */
  title: string;
  /** Selects a custom dialog treatment. Ignored by the native mode. @default 'compact' */
  variant?: ConfirmationDialogVariant;
};

/** Resolves the visual implementation while keeping custom dialogs the default. */
export function resolveConfirmationDialogMode(
  mode: ConfirmationDialogMode | undefined
): ConfirmationDialogMode {
  return mode ?? "custom";
}

/** Builds consistent actions when a caller does not supply native Alert buttons. */
export function getConfirmationDialogButtons(
  options: ConfirmationDialogOptions
): AlertButton[] {
  if (options.buttons) return options.buttons;

  const buttons: AlertButton[] = [];

  if (options.cancelLabel !== undefined || options.onCancel !== undefined) {
    buttons.push({
      onPress: options.onCancel,
      style: "cancel",
      text: options.cancelLabel ?? "Cancel",
    });
  }

  buttons.push({
    onPress: options.onConfirm,
    style: options.destructive ? "destructive" : "default",
    text: options.confirmLabel ?? "OK",
  });

  return buttons;
}

/** Maps shared dismissal semantics to React Native's native Alert options. */
export function getConfirmationDialogAlertOptions(
  options: ConfirmationDialogOptions
): AlertOptions {
  return {
    cancelable: options.cancelable ?? true,
    onDismiss: options.onCancel,
  };
}
