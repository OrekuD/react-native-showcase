import type { ColorValue } from 'react-native';

/** Semantic colors used by {@link OtpInput}. */
export type OtpInputColorTheme = {
  /** Color of the active cell border or underline. */
  focus?: ColorValue;
  /** Color of the insertion cursor. */
  cursor?: ColorValue;
  /** Surface used by filled cells and inline groups. */
  surface?: ColorValue;
  /** Resting border color used by outline cells. */
  outlineBorder?: ColorValue;
  /** Resting underline color used by underline cells. */
  underline?: ColorValue;
  /** Color of entered characters. */
  text?: ColorValue;
  /** Color of the configured placeholder characters. */
  placeholder?: ColorValue;
  /** Color of the optional middle separator. */
  separator?: ColorValue;
  /** Color of the dividers between inline cells. */
  inlineDivider?: ColorValue;
};

/** Tokens accepted by {@link OtpInputThemeProvider}. */
export type OtpInputTheme = {
  /** Semantic color overrides for every OTP input in the provider subtree. */
  colors?: OtpInputColorTheme;
};

export type ResolvedOtpInputTheme = {
  colors: Required<OtpInputColorTheme>;
};

/** Built-in OTP tokens used without a provider. */
export const DEFAULT_OTP_INPUT_THEME = {
  colors: {
    cursor: '#6558D9',
    focus: '#6558D9',
    inlineDivider: 'rgba(138, 143, 151, 0.18)',
    outlineBorder: '#BCB9B2',
    placeholder: '#AAA69E',
    separator: '#908C84',
    surface: '#E7E9ED',
    text: '#1D1D1B',
    underline: '#858B92',
  },
} as const satisfies ResolvedOtpInputTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeOtpInputTheme(
  baseTheme: ResolvedOtpInputTheme,
  theme?: OtpInputTheme,
): ResolvedOtpInputTheme {
  return {
    colors: {
      ...baseTheme.colors,
      ...theme?.colors,
    },
  };
}
