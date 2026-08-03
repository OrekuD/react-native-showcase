import type { TextStyle } from "react-native";

/** Colors used by a toast surface. */
export type ToastSurfaceTheme = {
  /** Surface fill color. */
  backgroundColor?: string;
  /** Surface border color. */
  borderColor?: string;
  /** Color behind a leading icon. */
  iconBackgroundColor?: string;
  /** Foreground color intended for a leading icon. */
  iconColor?: string;
  /** Main label color. */
  labelColor?: string;
  /** Action label color. */
  actionColor?: string;
};

/** Spacing and sizing shared by toast surfaces. */
export type ToastLayoutTheme = {
  /** Space between the icon, message, and actions. */
  gap?: number;
  /** Width and height of the leading icon container. */
  iconSize?: number;
  /** Minimum height of the toast surface. */
  minHeight?: number;
  /** Horizontal surface padding. */
  paddingHorizontal?: number;
  /** Vertical surface padding. */
  paddingVertical?: number;
};

/** Typography tokens for toast text. */
export type ToastLabelTheme = {
  /** Label font size. */
  fontSize?: number;
  /** Label font weight. */
  fontWeight?: TextStyle["fontWeight"];
  /** Additional spacing between label characters. */
  letterSpacing?: number;
  /** Label line height. */
  lineHeight?: number;
};

/** Visual tokens accepted by providers and individual toasts. */
export type ToastTheme = ToastSurfaceTheme & {
  /** Typography used by action labels. */
  actionLabel?: ToastLabelTheme;
  /** Corner radius of toast surfaces in density-independent pixels. */
  borderRadius?: number;
  /** Continuous-corner smoothing from 0 to 1. */
  cornerSmoothing?: number;
  /** Typography used by the main toast message. */
  label?: ToastLabelTheme;
  /** Shared surface spacing and sizing. */
  layout?: ToastLayoutTheme;
  /** Shadow color used below floating toast surfaces. */
  shadowColor?: string;
};

/** Tokens that customize one toast without changing surrounding defaults. */
export type ToastThemeOverride = ToastTheme;

/** Fully resolved colors for one toast surface. */
export type ResolvedToastSurfaceTheme = Required<ToastSurfaceTheme>;

/** Fully resolved spacing and sizing for a toast surface. */
export type ResolvedToastLayoutTheme = Required<ToastLayoutTheme>;

/** Fully resolved typography for toast text. */
export type ResolvedToastLabelTheme = Required<ToastLabelTheme>;

/** Fully resolved visual tokens used by rendered toast surfaces. */
export type ResolvedToastTheme = {
  actionLabel: ResolvedToastLabelTheme;
  borderRadius: number;
  cornerSmoothing: number;
  label: ResolvedToastLabelTheme;
  layout: ResolvedToastLayoutTheme;
  shadowColor: string;
  surface: ResolvedToastSurfaceTheme;
};

/** Fully resolved tokens used to render one toast. */
export type ResolvedToastTokens = ResolvedToastTheme;

/** Built-in neutral toast tokens used without theme overrides. */
export const DEFAULT_TOAST_THEME = {
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.15,
    lineHeight: 18,
  },
  borderRadius: 22,
  cornerSmoothing: 0.92,
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  layout: {
    gap: 10,
    iconSize: 32,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  shadowColor: "#181A17",
  surface: {
    actionColor: "#252522",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(37, 37, 34, 0.10)",
    iconBackgroundColor: "#F0EFEB",
    iconColor: "#252522",
    labelColor: "#252522",
  },
} as const satisfies ResolvedToastTheme;

/** Combines partial tokens with an already resolved toast theme. */
export function mergeToastTheme(
  baseTheme: ResolvedToastTheme,
  theme?: ToastTheme,
): ResolvedToastTheme {
  const {
    actionLabel,
    borderRadius,
    cornerSmoothing,
    label,
    layout,
    shadowColor,
    ...surfaceOverride
  } = theme ?? {};

  return {
    actionLabel: { ...baseTheme.actionLabel, ...actionLabel },
    borderRadius: borderRadius ?? baseTheme.borderRadius,
    cornerSmoothing: cornerSmoothing ?? baseTheme.cornerSmoothing,
    label: { ...baseTheme.label, ...label },
    layout: { ...baseTheme.layout, ...layout },
    shadowColor: shadowColor ?? baseTheme.shadowColor,
    surface: { ...baseTheme.surface, ...surfaceOverride },
  };
}

/** Resolves one toast after provider and local overrides. */
export function resolveToastTokens(
  theme: ResolvedToastTheme,
  override?: ToastThemeOverride,
): ResolvedToastTokens {
  return mergeToastTheme(theme, override);
}
