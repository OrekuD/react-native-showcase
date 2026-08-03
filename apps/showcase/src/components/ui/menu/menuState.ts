/** Available rendering strategies for {@link Menu}. */
export type MenuMode = "custom" | "native";

/** Density options for custom {@link Menu.Content} items. */
export type MenuSize = "default" | "compact";

/** Horizontal alignment of custom menu content relative to its trigger. */
export type MenuAlign = "end" | "start";

/** Resolves the default custom rendering path. */
export function resolveMenuMode(mode: MenuMode | undefined): MenuMode {
  return mode ?? "custom";
}
