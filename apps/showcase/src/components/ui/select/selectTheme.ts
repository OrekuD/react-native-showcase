/** Visual tokens accepted by {@link SelectThemeProvider} and custom {@link Select} controls. */
export type SelectTheme = {
  /** Background color of the custom select panel. */
  backgroundColor?: string;
  /** Border color of the custom select panel. */
  borderColor?: string;
  /** Custom select panel corner radius in density-independent pixels. */
  borderRadius?: number;
  /** Color used by the selected option's trailing checkmark. */
  checkmarkColor?: string;
  /** Continuous-corner smoothing from 0 to 1 for the custom select panel. */
  cornerSmoothing?: number;
  /** Color used for option descriptions. */
  descriptionColor?: string;
  /** Background color behind leading option icons. */
  iconBackgroundColor?: string;
  /** Color used for option labels. */
  labelColor?: string;
  /** Color used by custom select group labels. */
  sectionLabelColor?: string;
  /** Color used by the custom select panel shadow. */
  shadowColor?: string;
};

/** Tokens that customize one custom {@link Select} without changing its surrounding theme. */
export type SelectThemeOverride = SelectTheme;

/** Fully resolved custom {@link Select} visual tokens. */
export type ResolvedSelectTheme = Required<SelectTheme>;

/** Built-in custom select tokens used without a provider or local override. */
export const DEFAULT_SELECT_THEME = {
  backgroundColor: "#F9F9F9",
  borderColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: 28,
  checkmarkColor: "#6558D9",
  cornerSmoothing: 0.9,
  descriptionColor: "#77736B",
  iconBackgroundColor: "rgba(29, 29, 27, 0.08)",
  labelColor: "#11110F",
  sectionLabelColor: "#77736B",
  shadowColor: "#1D1D1B",
} as const satisfies ResolvedSelectTheme;

/** Combines a partial provider theme with an already resolved parent theme. */
export function mergeSelectTheme(
  baseTheme: ResolvedSelectTheme,
  theme?: SelectTheme
): ResolvedSelectTheme {
  return {
    ...baseTheme,
    ...theme,
  };
}

/** Resolves a custom select's provider and local visual tokens. */
export function resolveSelectTokens(
  theme: ResolvedSelectTheme,
  override?: SelectThemeOverride
): ResolvedSelectTheme {
  return {
    ...theme,
    ...override,
  };
}
