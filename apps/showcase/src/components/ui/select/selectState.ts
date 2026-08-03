/** Chooses Expo UI's menu-backed control or Showcase's custom popover. */
export type SelectMode = "custom" | "native";

/** Density options for custom select options. */
export type SelectSize = "default" | "compact";

/** Horizontal alignment of custom select content relative to its trigger. */
export type SelectAlign = "end" | "start";

/** Resolves the copyable custom select by default. */
export function resolveSelectMode(mode: SelectMode | undefined): SelectMode {
  return mode ?? "custom";
}

/** Determines whether an item corresponds to the current selected value. */
export function isSelectValueSelected(
  value: string | undefined,
  itemValue: string
): boolean {
  return value === itemValue;
}
