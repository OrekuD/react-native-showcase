import type { TextStyle } from 'react-native';

/** Visual treatments supported by the Button component. */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

/** Layout sizes supported by the Button component. */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/** Color and border tokens for a button variant. */
export type ButtonAppearance = {
  /** Background color rendered by the button frame. */
  backgroundColor?: string;
  /** Border color rendered by the button frame. */
  borderColor?: string;
  /** Border width in density-independent pixels. */
  borderWidth?: number;
  /** Color provided to labels, icons, and loading indicators. */
  foregroundColor?: string;
};

/** Typography tokens shared by button labels. */
export type ButtonLabelTheme = {
  /** Label font size in density-independent pixels. */
  fontSize?: number;
  /** Label font weight. */
  fontWeight?: TextStyle['fontWeight'];
  /** Additional spacing between label characters. */
  letterSpacing?: number;
};

/** Layout tokens for one button size. */
export type ButtonSizeTheme = {
  /** Button height in density-independent pixels. */
  height?: number;
  /** Icon frame size in density-independent pixels. */
  iconSize?: number;
  /** Horizontal content padding in density-independent pixels. */
  paddingHorizontal?: number;
};

/** App-wide defaults accepted by ButtonThemeProvider. */
export type ButtonTheme = {
  /** Continuous-corner smoothing from 0 to 1. */
  cornerSmoothing?: number;
  /** Shared label typography. */
  label?: ButtonLabelTheme;
  /** Overrides for each named button size. */
  sizes?: Partial<Record<ButtonSize, ButtonSizeTheme>>;
  /** Overrides for each named button variant. */
  variants?: Partial<Record<ButtonVariant, ButtonAppearance>>;
};

/** Tokens that customize one Button without changing its surrounding theme. */
export type ButtonThemeOverride = ButtonAppearance & {
  /** Continuous-corner smoothing from 0 to 1. */
  cornerSmoothing?: number;
  /** Typography overrides for this button's label. */
  label?: ButtonLabelTheme;
  /** Layout overrides for this button's selected size. */
  size?: ButtonSizeTheme;
};

type ResolvedButtonAppearance = Required<ButtonAppearance>;
type ResolvedButtonLabelTheme = Required<ButtonLabelTheme>;
type ResolvedButtonSizeTheme = Required<ButtonSizeTheme>;

export type ResolvedButtonTheme = {
  cornerSmoothing: number;
  label: ResolvedButtonLabelTheme;
  sizes: Record<ButtonSize, ResolvedButtonSizeTheme>;
  variants: Record<ButtonVariant, ResolvedButtonAppearance>;
};

export type ResolvedButtonTokens = {
  appearance: ResolvedButtonAppearance;
  cornerSmoothing: number;
  label: ResolvedButtonLabelTheme;
  size: ResolvedButtonSizeTheme;
};

/** Built-in theme used when no provider or per-button overrides are supplied. */
export const DEFAULT_BUTTON_THEME = {
  cornerSmoothing: 0.8,
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sizes: {
    icon: { height: 48, iconSize: 20, paddingHorizontal: 0 },
    lg: { height: 60, iconSize: 22, paddingHorizontal: 26 },
    md: { height: 52, iconSize: 20, paddingHorizontal: 22 },
    sm: { height: 40, iconSize: 17, paddingHorizontal: 15 },
  },
  variants: {
    destructive: {
      backgroundColor: 'transparent',
      borderColor: '#E8B7B3',
      borderWidth: 1,
      foregroundColor: '#B73C36',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      foregroundColor: '#6558D9',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#D5D3CF',
      borderWidth: 1.5,
      foregroundColor: '#1D1D1B',
    },
    primary: {
      backgroundColor: '#1D1D1B',
      borderColor: 'transparent',
      borderWidth: 0,
      foregroundColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      borderColor: 'transparent',
      borderWidth: 0,
      foregroundColor: '#1D1D1B',
    },
  },
} as const satisfies ResolvedButtonTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeButtonTheme(
  baseTheme: ResolvedButtonTheme,
  theme?: ButtonTheme,
): ResolvedButtonTheme {
  return {
    cornerSmoothing: theme?.cornerSmoothing ?? baseTheme.cornerSmoothing,
    label: {
      ...baseTheme.label,
      ...theme?.label,
    },
    sizes: {
      icon: { ...baseTheme.sizes.icon, ...theme?.sizes?.icon },
      lg: { ...baseTheme.sizes.lg, ...theme?.sizes?.lg },
      md: { ...baseTheme.sizes.md, ...theme?.sizes?.md },
      sm: { ...baseTheme.sizes.sm, ...theme?.sizes?.sm },
    },
    variants: {
      destructive: {
        ...baseTheme.variants.destructive,
        ...theme?.variants?.destructive,
      },
      ghost: { ...baseTheme.variants.ghost, ...theme?.variants?.ghost },
      outline: { ...baseTheme.variants.outline, ...theme?.variants?.outline },
      primary: { ...baseTheme.variants.primary, ...theme?.variants?.primary },
      secondary: {
        ...baseTheme.variants.secondary,
        ...theme?.variants?.secondary,
      },
    },
  };
}

/** Resolves the tokens used by one button after provider and local overrides. */
export function resolveButtonTokens(
  theme: ResolvedButtonTheme,
  variant: ButtonVariant,
  size: ButtonSize,
  override?: ButtonThemeOverride,
): ResolvedButtonTokens {
  const {
    backgroundColor,
    borderColor,
    borderWidth,
    cornerSmoothing,
    foregroundColor,
    label,
    size: sizeOverride,
  } = override ?? {};

  return {
    appearance: {
      backgroundColor:
        backgroundColor ?? theme.variants[variant].backgroundColor,
      borderColor: borderColor ?? theme.variants[variant].borderColor,
      borderWidth: borderWidth ?? theme.variants[variant].borderWidth,
      foregroundColor:
        foregroundColor ?? theme.variants[variant].foregroundColor,
    },
    cornerSmoothing: cornerSmoothing ?? theme.cornerSmoothing,
    label: {
      ...theme.label,
      ...label,
    },
    size: {
      ...theme.sizes[size],
      ...sizeOverride,
    },
  };
}
