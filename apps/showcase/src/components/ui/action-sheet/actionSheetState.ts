export type ActionSheetMode = "automatic" | "custom";
export type ResolvedActionSheetMode = "native" | "custom";
export type ActionSheetDismissReason = "programmatic" | "selection" | null;
export type ActionSheetPlatform = "ios" | "android" | "web" | string;

export type ActionSheetStateAction = Readonly<{
  disabled?: boolean;
  destructive?: boolean;
  id: string;
  label: string;
}>;

export type NativeActionSheetOptionsInput = Readonly<{
  actions: readonly ActionSheetStateAction[];
  cancelLabel?: string;
  message?: string;
  title?: string;
}>;

export type NativeActionSheetOptions = Readonly<{
  cancelButtonIndex: number;
  destructiveButtonIndex: number[];
  disabledButtonIndices: number[];
  message?: string;
  options: string[];
  title?: string;
}>;

export function resolveActionSheetMode(
  mode: ActionSheetMode | undefined,
  platform: ActionSheetPlatform
): ResolvedActionSheetMode {
  return mode !== "custom" && platform === "ios" ? "native" : "custom";
}

export function isActionSheetCancellation(reason: ActionSheetDismissReason) {
  return reason === null;
}

export function validateActionSheetActions(actions: readonly ActionSheetStateAction[]) {
  const actionIds = new Set<string>();

  for (const action of actions) {
    if (actionIds.has(action.id)) {
      throw new Error(`ActionSheet actions require a unique id. Duplicate: ${action.id}`);
    }
    actionIds.add(action.id);
  }
}

export function createNativeActionSheetOptions({
  actions,
  cancelLabel = "Cancel",
  message,
  title,
}: NativeActionSheetOptionsInput): NativeActionSheetOptions {
  validateActionSheetActions(actions);

  return {
    cancelButtonIndex: actions.length,
    destructiveButtonIndex: actions.flatMap((action, index) =>
      action.destructive ? [index] : []
    ),
    disabledButtonIndices: actions.flatMap((action, index) =>
      action.disabled ? [index] : []
    ),
    message,
    options: [...actions.map((action) => action.label), cancelLabel],
    title,
  };
}
