import type { SwitchVariant } from './switchState.ts';
import { SWITCH_VARIANT_LAYOUTS } from './switchState.ts';

/** Colors rendered by a Switch in one checked state. */
export type SwitchColorTheme = {
  /** Border color of the custom switch track. */
  borderColor?: string;
  /** Color of the custom switch thumb and the native Switch thumb. */
  thumbColor?: string;
  /** Color of the custom switch track and the native Switch track. */
  trackColor?: string;
};

/** Shared visual tokens accepted by {@link SwitchThemeProvider}. */
export type SwitchTheme = {
  /** Continuous-corner smoothing from 0 to 1 for custom tracks and thumbs. */
  cornerSmoothing?: number;
  /** Colors used while the switch is off. */
  off?: SwitchColorTheme;
  /** Colors used while the switch is on. */
  on?: SwitchColorTheme;
};

/** Tokens that customize one {@link Switch} without changing its surrounding theme. */
export type SwitchThemeOverride = SwitchTheme;

export type ResolvedSwitchColorTheme = Required<SwitchColorTheme>;

export type ResolvedSwitchTheme = {
  cornerSmoothing: number;
  off: SwitchColorTheme;
  on: SwitchColorTheme;
};

export type ResolvedSwitchTokens = {
  cornerSmoothing: number;
  layout: (typeof SWITCH_VARIANT_LAYOUTS)[SwitchVariant];
  off: ResolvedSwitchColorTheme;
  on: ResolvedSwitchColorTheme;
};

const DEFAULT_SWITCH_VARIANT_COLORS = {
  outline: {
    off: {
      borderColor: '#908C84',
      thumbColor: '#908C84',
      trackColor: 'transparent',
    },
    on: {
      borderColor: '#1D1D1B',
      thumbColor: '#1D1D1B',
      trackColor: 'transparent',
    },
  },
  solid: {
    off: {
      borderColor: '#D1D5DB',
      thumbColor: '#FFFFFF',
      trackColor: '#D1D5DB',
    },
    on: {
      borderColor: '#00C853',
      thumbColor: '#FFFFFF',
      trackColor: '#00C853',
    },
  },
  'solid-tight': {
    off: {
      borderColor: '#D1D5DB',
      thumbColor: '#FFFFFF',
      trackColor: '#D1D5DB',
    },
    on: {
      borderColor: '#5962EE',
      thumbColor: '#FFFFFF',
      trackColor: '#5962EE',
    },
  },
} as const satisfies Record<
  SwitchVariant,
  { off: ResolvedSwitchColorTheme; on: ResolvedSwitchColorTheme }
>;

/** Built-in Switch tokens used without a provider. */
export const DEFAULT_SWITCH_THEME = {
  cornerSmoothing: 0.9,
  off: {},
  on: {},
} as const satisfies ResolvedSwitchTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeSwitchTheme(
  baseTheme: ResolvedSwitchTheme,
  theme?: SwitchTheme,
): ResolvedSwitchTheme {
  return {
    cornerSmoothing: theme?.cornerSmoothing ?? baseTheme.cornerSmoothing,
    off: {
      ...baseTheme.off,
      ...theme?.off,
    },
    on: {
      ...baseTheme.on,
      ...theme?.on,
    },
  };
}

/** Resolves a switch's active variant colors after provider and local overrides. */
export function resolveSwitchTokens(
  theme: ResolvedSwitchTheme,
  variant: SwitchVariant,
  override?: SwitchThemeOverride,
): ResolvedSwitchTokens {
  const defaults = DEFAULT_SWITCH_VARIANT_COLORS[variant];

  return {
    cornerSmoothing: override?.cornerSmoothing ?? theme.cornerSmoothing,
    layout: SWITCH_VARIANT_LAYOUTS[variant],
    off: {
      ...defaults.off,
      ...theme.off,
      ...override?.off,
    },
    on: {
      ...defaults.on,
      ...theme.on,
      ...override?.on,
    },
  };
}
