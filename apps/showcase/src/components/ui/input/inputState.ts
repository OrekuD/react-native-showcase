export type InputStatus = 'default' | 'success' | 'error';

export type InputMessageTone = 'info' | 'success' | 'error';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputAppearance = 'filled' | 'stacked' | 'notched' | 'external';

export const DEFAULT_INPUT_SIZE: InputSize = 'md';

/** Returns whether a text input contains content that can be cleared. */
export function hasInputContent(value?: string): boolean {
  return Boolean(value?.length);
}

type ResolveInputHorizontalInsetsOptions = {
  basePadding: number;
  hasLeading: boolean;
  hasTrailing: boolean;
  leadingPadding: number;
  trailingPadding: number;
};

/** Keeps control text clear of composed leading and trailing adornments. */
export function resolveInputHorizontalInsets({
  basePadding,
  hasLeading,
  hasTrailing,
  leadingPadding,
  trailingPadding,
}: ResolveInputHorizontalInsetsOptions) {
  return {
    paddingLeft: hasLeading ? leadingPadding : basePadding,
    paddingRight: hasTrailing ? trailingPadding : basePadding,
  };
}

/** Reserves a clear gap between an external label and its field container. */
export function resolveInputExternalLabelOffset(labelLineHeight: number) {
  return labelLineHeight + 6;
}

type ResolveInputFocusColorsOptions = {
  appearance: InputAppearance;
  defaultColor: string;
  defaultBorderColor: string;
  filledDefaultBorderColor: string;
  focusColor?: string;
};

/** Resolves focused field and adornment colors while preserving defaults. */
export function resolveInputFocusColors({
  appearance,
  defaultColor,
  defaultBorderColor,
  filledDefaultBorderColor,
  focusColor,
}: ResolveInputFocusColorsOptions) {
  return {
    borderColor:
      focusColor ??
      (appearance === 'filled'
        ? filledDefaultBorderColor
        : defaultBorderColor),
    contentColor: focusColor ?? defaultColor,
  };
}

type ResolveInputStatusOptions = {
  errorText?: unknown;
  invalid?: boolean;
  status?: InputStatus;
};

/** Resolves the size used by every part of a composed input. */
export function resolveInputSize(size?: InputSize): InputSize {
  return size ?? DEFAULT_INPUT_SIZE;
}

/** Resolves the visual state used by the compound Input components. */
export function resolveInputStatus({
  errorText,
  invalid = false,
  status = 'default',
}: ResolveInputStatusOptions): InputStatus {
  if (invalid || errorText !== undefined) {
    return 'error';
  }

  return status;
}

/** Resolves a message's default tone from the current input status. */
export function resolveInputMessageTone(
  status: InputStatus,
  tone?: InputMessageTone,
): InputMessageTone {
  if (tone) {
    return tone;
  }

  if (status === 'error') {
    return 'error';
  }

  if (status === 'success') {
    return 'success';
  }

  return 'info';
}
