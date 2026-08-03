/** Visual tokens accepted by {@link MenuThemeProvider} and custom {@link Menu} menus. */
export type MenuTheme = {
  /** Background color of the custom menu panel. */
  backgroundColor?: string;
  /** Border color of the custom menu panel. */
  borderColor?: string;
  /** Custom menu panel corner radius in density-independent pixels. */
  borderRadius?: number;
  /** Continuous-corner smoothing from 0 to 1 for the custom menu panel. */
  cornerSmoothing?: number;
  /** Color used for non-destructive option descriptions. */
  descriptionColor?: string;
  /** Color used for destructive option descriptions. */
  destructiveDescriptionColor?: string;
  /** Color used for destructive option labels. */
  destructiveLabelColor?: string;
  /** Background color behind leading custom menu icons. */
  iconBackgroundColor?: string;
  /** Color used for non-destructive option labels. */
  labelColor?: string;
  /** Color used by custom menu section labels. */
  sectionLabelColor?: string;
  /** Color used by custom menu dividers. */
  separatorColor?: string;
  /** Color used by the custom menu panel shadow. */
  shadowColor?: string;
};

/** Tokens that customize one custom {@link Menu} without changing its surrounding theme. */
export type MenuThemeOverride = MenuTheme;

/** Fully resolved custom {@link Menu} visual tokens. */
export type ResolvedMenuTheme = Required<MenuTheme>;

/** Built-in custom menu tokens used without a provider or local override. */
export const DEFAULT_MENU_THEME = {
  backgroundColor: "#F9F9F9",
  borderColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: 32,
  cornerSmoothing: 0.9,
  descriptionColor: "#77736B",
  destructiveDescriptionColor: "#B5473D",
  destructiveLabelColor: "#B42318",
  iconBackgroundColor: "rgba(29, 29, 27, 0.08)",
  labelColor: "#11110F",
  sectionLabelColor: "#77736B",
  separatorColor: "rgba(29, 29, 27, 0.16)",
  shadowColor: "#1D1D1B",
} as const satisfies ResolvedMenuTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeMenuTheme(
  baseTheme: ResolvedMenuTheme,
  theme?: MenuTheme
): ResolvedMenuTheme {
  return {
    ...baseTheme,
    ...theme,
  };
}

/** Resolves a custom menu's provider and local visual tokens. */
export function resolveMenuTokens(
  theme: ResolvedMenuTheme,
  override?: MenuThemeOverride
): ResolvedMenuTheme {
  return {
    ...theme,
    ...override,
  };
}
