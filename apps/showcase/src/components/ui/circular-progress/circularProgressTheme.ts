/** Shared visual tokens accepted by {@link CircularProgressThemeProvider}. */
export type CircularProgressTheme = {
  /** Default color used by {@link CircularProgressIndicator}. */
  indicatorColor?: string;
  /** Default color used by {@link CircularProgressTrack}. */
  trackColor?: string;
};

/** Tokens that customize one {@link CircularProgressRoot} without changing ancestors. */
export type CircularProgressThemeOverride = CircularProgressTheme;

/** Fully resolved visual tokens used by rendered circular progress rings. */
export type ResolvedCircularProgressTheme = Required<CircularProgressTheme>;

/** Built-in circular progress tokens used without provider or local overrides. */
export const DEFAULT_CIRCULAR_PROGRESS_THEME = {
  indicatorColor: "#6558D9",
  trackColor: "#DDD9D0",
} as const satisfies ResolvedCircularProgressTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeCircularProgressTheme(
  baseTheme: ResolvedCircularProgressTheme,
  theme?: CircularProgressTheme,
): ResolvedCircularProgressTheme {
  return { ...baseTheme, ...theme };
}

/** Resolves local ring tokens after inherited theme values. */
export function resolveCircularProgressTokens(
  theme: ResolvedCircularProgressTheme,
  override?: CircularProgressThemeOverride,
): ResolvedCircularProgressTheme {
  return mergeCircularProgressTheme(theme, override);
}
