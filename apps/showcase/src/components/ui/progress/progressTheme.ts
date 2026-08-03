/** Shared visual tokens accepted by {@link ProgressThemeProvider}. */
export type ProgressTheme = {
  /** Continuous-corner smoothing from 0 to 1 for the track and indicator. */
  cornerSmoothing?: number;
  /** Default fill color used by {@link Progress}. */
  indicatorColor?: string;
  /** Default background color used by {@link Progress}. */
  trackColor?: string;
};

/** Tokens that customize one {@link Progress} without changing ancestors. */
export type ProgressThemeOverride = ProgressTheme;

/** Fully resolved visual tokens used by rendered linear progress bars. */
export type ResolvedProgressTheme = Required<ProgressTheme>;

/** Built-in progress tokens used without provider or local overrides. */
export const DEFAULT_PROGRESS_THEME = {
  cornerSmoothing: 0.9,
  indicatorColor: "#6558D9",
  trackColor: "#DDD9D0",
} as const satisfies ResolvedProgressTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeProgressTheme(
  baseTheme: ResolvedProgressTheme,
  theme?: ProgressTheme,
): ResolvedProgressTheme {
  return { ...baseTheme, ...theme };
}

/** Resolves local progress tokens after inherited theme values. */
export function resolveProgressTokens(
  theme: ResolvedProgressTheme,
  override?: ProgressThemeOverride,
): ResolvedProgressTheme {
  return mergeProgressTheme(theme, override);
}
