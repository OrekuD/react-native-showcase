export type ActionSheetTheme = {
  actionGap?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  cornerSmoothing?: number;
  descriptionColor?: string;
  destructiveLabelColor?: string;
  detachedOffset?: number;
  handleColor?: string;
  horizontalInset?: number;
  iconBackgroundColor?: string;
  iconColor?: string;
  iconContainerSize?: number;
  iconSize?: number;
  itemBackgroundColor?: string;
  itemBorderRadius?: number;
  itemCornerSmoothing?: number;
  itemGap?: number;
  itemMinHeight?: number;
  itemPaddingHorizontal?: number;
  itemPaddingVertical?: number;
  labelColor?: string;
  labelFontSize?: number;
  messageColor?: string;
  panelPadding?: number;
  separatorColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  showHandle?: boolean;
  textAlign?: "left" | "center" | "right";
  titleColor?: string;
  titleFontSize?: number;
};

export type ActionSheetThemeOverride = ActionSheetTheme;
export type ResolvedActionSheetTheme = Required<ActionSheetTheme>;

export const DEFAULT_ACTION_SHEET_THEME = {
  actionGap: 0,
  backgroundColor: "#F9F9F9",
  borderColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: 28,
  cornerSmoothing: 0.9,
  descriptionColor: "#77736B",
  destructiveLabelColor: "#B42318",
  detachedOffset: 16,
  handleColor: "rgba(29, 29, 27, 0.24)",
  horizontalInset: 16,
  iconBackgroundColor: "rgba(29, 29, 27, 0.08)",
  iconColor: "#151513",
  iconContainerSize: 36,
  iconSize: 18,
  itemBackgroundColor: "transparent",
  itemBorderRadius: 0,
  itemCornerSmoothing: 0,
  itemGap: 10,
  itemMinHeight: 48,
  itemPaddingHorizontal: 8,
  itemPaddingVertical: 6,
  labelColor: "#11110F",
  labelFontSize: 16,
  messageColor: "#77736B",
  panelPadding: 8,
  separatorColor: "rgba(29, 29, 27, 0.16)",
  shadowColor: "#1D1D1B",
  shadowOpacity: 0.14,
  showHandle: true,
  textAlign: "left",
  titleColor: "#11110F",
  titleFontSize: 17,
} as const satisfies ResolvedActionSheetTheme;

export function mergeActionSheetTheme(
  baseTheme: ResolvedActionSheetTheme,
  theme?: ActionSheetTheme
): ResolvedActionSheetTheme {
  return { ...baseTheme, ...theme };
}

export function resolveActionSheetTokens(
  theme: ResolvedActionSheetTheme,
  override?: ActionSheetThemeOverride
): ResolvedActionSheetTheme {
  return { ...theme, ...override };
}
