export type OtpInputVariant =
  | "inline"
  | "outline"
  | "filled"
  | "underline";

/** Controls the scale of an {@link OtpInput}. */
export type OtpInputSize = "sm" | "lg";

export const DEFAULT_OTP_INPUT_VARIANT: OtpInputVariant = "outline";
export const DEFAULT_OTP_INPUT_SIZE: OtpInputSize = "lg";

/** Resolves the visual treatment used by the OTP entry. */
export function resolveOtpInputVariant(
  variant?: OtpInputVariant
): OtpInputVariant {
  return variant ?? DEFAULT_OTP_INPUT_VARIANT;
}

/** Resolves the default large presentation when no size is specified. */
export function resolveOtpInputSize(size?: OtpInputSize): OtpInputSize {
  return size ?? DEFAULT_OTP_INPUT_SIZE;
}

type ShouldRenderOtpSeparatorOptions = {
  numberOfDigits: number;
  separator?: boolean;
};

/** A middle separator only has a clear position between an even number of cells. */
export function shouldRenderOtpSeparator({
  numberOfDigits,
  separator,
}: ShouldRenderOtpSeparatorOptions) {
  return Boolean(separator) && numberOfDigits >= 2 && numberOfDigits % 2 === 0;
}

type ShouldRenderInlineOtpGroupsOptions = ShouldRenderOtpSeparatorOptions & {
  variant: OtpInputVariant;
};

/** Inline OTP cells use two filled surfaces only when their divider is visible. */
export function shouldRenderInlineOtpGroups({
  variant,
  ...options
}: ShouldRenderInlineOtpGroupsOptions) {
  return variant === "inline" && shouldRenderOtpSeparator(options);
}
