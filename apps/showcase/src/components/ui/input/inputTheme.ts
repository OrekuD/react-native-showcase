import type { InputAppearance, InputSize } from './inputState';

/** Semantic colors shared by every Input appearance. */
export type InputColorTheme = {
  /** Color used by disabled labels, text, and adornments. */
  disabled?: string;
  /** Color used by invalid fields and error messages. */
  error?: string;
  /** Color used by focused labels, carets, and adornments. */
  focus?: string;
  /** Default focused border color for non-filled appearances. */
  focusBorder?: string;
  /** Default focused border color for the filled appearance. */
  filledFocusBorder?: string;
  /** Default background behind overlapping labels. */
  labelBackground?: string;
  /** Color used by supporting text and inactive adornments. */
  muted?: string;
  /** Color used by successful fields and messages. */
  success?: string;
  /** Color used by editable text. */
  text?: string;
};

/** Frame tokens for one Input appearance. */
export type InputAppearanceTheme = {
  /** Field background color. */
  backgroundColor?: string;
  /** Resting field border color. */
  borderColor?: string;
  /** Field corner radius in density-independent pixels. */
  borderRadius?: number;
  /** Field border width in density-independent pixels. */
  borderWidth?: number;
};

/** Layout and typography tokens for one Input size. */
export type InputSizeTheme = {
  actionSize?: number;
  borderLabelPadding?: number;
  borderLabelTop?: number;
  controlFontSize?: number;
  controlHorizontalPadding?: Partial<Record<InputAppearance, number>>;
  controlLeadingPadding?: number;
  controlPaddingBottom?: number;
  controlPaddingTop?: Partial<Record<InputAppearance, number>>;
  controlPaddingTopWithLabel?: Partial<Record<InputAppearance, number>>;
  controlTrailingPadding?: number;
  externalLabelLeft?: number;
  fieldHeight?: number;
  iconSize?: number;
  insetLabelLeft?: number;
  insetLabelTop?: number;
  labelFontSize?: number;
  labelLineHeight?: number;
  messageFontSize?: number;
  messageLineHeight?: number;
  notchedLabelLeft?: number;
  trailingWidth?: number;
};

/** App-wide defaults accepted by InputThemeProvider. */
export type InputTheme = {
  /** Frame overrides for each appearance. */
  appearances?: Partial<Record<InputAppearance, InputAppearanceTheme>>;
  /** Shared semantic color overrides. */
  colors?: InputColorTheme;
  /** Continuous-corner smoothing from 0 to 1. */
  cornerSmoothing?: number;
  /** Layout overrides for each named size. */
  sizes?: Partial<Record<InputSize, InputSizeTheme>>;
};

/** Tokens that customize one Input without changing its surrounding theme. */
export type InputThemeOverride = {
  /** Frame overrides for this Input's selected appearance. */
  appearance?: InputAppearanceTheme;
  /** Semantic color overrides for this Input. */
  colors?: InputColorTheme;
  /** Continuous-corner smoothing from 0 to 1. */
  cornerSmoothing?: number;
  /** Layout overrides for this Input's selected size. */
  size?: InputSizeTheme;
};

type ResolvedInputColors = Required<InputColorTheme>;
type ResolvedInputAppearance = Required<InputAppearanceTheme>;
export type ResolvedInputSizeTheme = Required<
  Omit<
    InputSizeTheme,
    | 'controlHorizontalPadding'
    | 'controlPaddingTop'
    | 'controlPaddingTopWithLabel'
  >
> & {
  controlHorizontalPadding: Record<InputAppearance, number>;
  controlPaddingTop: Record<InputAppearance, number>;
  controlPaddingTopWithLabel: Record<InputAppearance, number>;
};

export type ResolvedInputTheme = {
  appearances: Record<InputAppearance, ResolvedInputAppearance>;
  colors: ResolvedInputColors;
  cornerSmoothing: number;
  sizes: Record<InputSize, ResolvedInputSizeTheme>;
};

export type ResolvedInputTokens = {
  appearance: ResolvedInputAppearance;
  colors: ResolvedInputColors;
  cornerSmoothing: number;
  size: ResolvedInputSizeTheme;
};

/** Built-in theme used without provider or per-input overrides. */
export const DEFAULT_INPUT_THEME = {
  appearances: {
    external: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D2D0CB',
      borderRadius: 10,
      borderWidth: 1.5,
    },
    filled: {
      backgroundColor: '#E7E9ED',
      borderColor: 'transparent',
      borderRadius: 20,
      borderWidth: 1.5,
    },
    notched: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D2D0CB',
      borderRadius: 14,
      borderWidth: 1.5,
    },
    stacked: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D2D0CB',
      borderRadius: 16,
      borderWidth: 1.5,
    },
  },
  colors: {
    disabled: '#A8A49B',
    error: '#B73C36',
    filledFocusBorder: '#8B82E3',
    focus: '#6558D9',
    focusBorder: '#6558D9',
    labelBackground: '#F2F0EA',
    muted: '#77736B',
    success: '#278572',
    text: '#1D1D1B',
  },
  cornerSmoothing: 0.6,
  sizes: {
    lg: {
      actionSize: 42,
      borderLabelPadding: 5,
      borderLabelTop: -10,
      controlFontSize: 17,
      controlHorizontalPadding: {
        external: 16,
        filled: 19,
        notched: 16,
        stacked: 16,
      },
      controlLeadingPadding: 46,
      controlPaddingBottom: 12,
      controlPaddingTop: {
        external: 12,
        filled: 12,
        notched: 15,
        stacked: 12,
      },
      controlPaddingTopWithLabel: {
        external: 12,
        filled: 22,
        notched: 15,
        stacked: 26,
      },
      controlTrailingPadding: 56,
      externalLabelLeft: 14,
      fieldHeight: 70,
      iconSize: 20,
      insetLabelLeft: 17,
      insetLabelTop: 8,
      labelFontSize: 14,
      labelLineHeight: 18,
      messageFontSize: 13,
      messageLineHeight: 18,
      notchedLabelLeft: 13,
      trailingWidth: 52,
    },
    md: {
      actionSize: 38,
      borderLabelPadding: 4,
      borderLabelTop: -9,
      controlFontSize: 16,
      controlHorizontalPadding: {
        external: 14,
        filled: 17,
        notched: 14,
        stacked: 14,
      },
      controlLeadingPadding: 42,
      controlPaddingBottom: 10,
      controlPaddingTop: {
        external: 10,
        filled: 10,
        notched: 12,
        stacked: 10,
      },
      controlPaddingTopWithLabel: {
        external: 10,
        filled: 18,
        notched: 12,
        stacked: 22,
      },
      controlTrailingPadding: 52,
      externalLabelLeft: 12,
      fieldHeight: 58,
      iconSize: 18,
      insetLabelLeft: 15,
      insetLabelTop: 7,
      labelFontSize: 13,
      labelLineHeight: 17,
      messageFontSize: 12.5,
      messageLineHeight: 17,
      notchedLabelLeft: 12,
      trailingWidth: 48,
    },
    sm: {
      actionSize: 34,
      borderLabelPadding: 4,
      borderLabelTop: -8,
      controlFontSize: 15,
      controlHorizontalPadding: {
        external: 12,
        filled: 15,
        notched: 12,
        stacked: 12,
      },
      controlLeadingPadding: 38,
      controlPaddingBottom: 8,
      controlPaddingTop: {
        external: 8,
        filled: 8,
        notched: 10,
        stacked: 8,
      },
      controlPaddingTopWithLabel: {
        external: 8,
        filled: 16,
        notched: 10,
        stacked: 19,
      },
      controlTrailingPadding: 48,
      externalLabelLeft: 11,
      fieldHeight: 50,
      iconSize: 16,
      insetLabelLeft: 13,
      insetLabelTop: 6,
      labelFontSize: 12,
      labelLineHeight: 16,
      messageFontSize: 12,
      messageLineHeight: 16,
      notchedLabelLeft: 11,
      trailingWidth: 44,
    },
  },
} as const satisfies ResolvedInputTheme;

function mergeInputSize(
  base: ResolvedInputSizeTheme,
  override?: InputSizeTheme,
): ResolvedInputSizeTheme {
  return {
    ...base,
    ...override,
    controlHorizontalPadding: {
      ...base.controlHorizontalPadding,
      ...override?.controlHorizontalPadding,
    },
    controlPaddingTop: {
      ...base.controlPaddingTop,
      ...override?.controlPaddingTop,
    },
    controlPaddingTopWithLabel: {
      ...base.controlPaddingTopWithLabel,
      ...override?.controlPaddingTopWithLabel,
    },
  };
}

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeInputTheme(
  base: ResolvedInputTheme,
  theme?: InputTheme,
): ResolvedInputTheme {
  return {
    appearances: {
      external: { ...base.appearances.external, ...theme?.appearances?.external },
      filled: { ...base.appearances.filled, ...theme?.appearances?.filled },
      notched: { ...base.appearances.notched, ...theme?.appearances?.notched },
      stacked: { ...base.appearances.stacked, ...theme?.appearances?.stacked },
    },
    colors: { ...base.colors, ...theme?.colors },
    cornerSmoothing: theme?.cornerSmoothing ?? base.cornerSmoothing,
    sizes: {
      lg: mergeInputSize(base.sizes.lg, theme?.sizes?.lg),
      md: mergeInputSize(base.sizes.md, theme?.sizes?.md),
      sm: mergeInputSize(base.sizes.sm, theme?.sizes?.sm),
    },
  };
}

/** Resolves tokens after provider and per-input overrides are applied. */
export function resolveInputTokens(
  theme: ResolvedInputTheme,
  appearance: InputAppearance,
  size: InputSize,
  override?: InputThemeOverride,
): ResolvedInputTokens {
  return {
    appearance: { ...theme.appearances[appearance], ...override?.appearance },
    colors: { ...theme.colors, ...override?.colors },
    cornerSmoothing: override?.cornerSmoothing ?? theme.cornerSmoothing,
    size: mergeInputSize(theme.sizes[size], override?.size),
  };
}
