import { Platform, type ViewStyle } from "react-native";

type OutsetShadowOptions = {
  blurRadius: number;
  color: string;
  elevation: number;
  offsetY: number;
  opacity: number;
};

function toRgba(color: string, opacity: number): string {
  const normalized = color.trim();
  const hex = normalized.slice(1);

  if (normalized.startsWith("#") && /^[\da-f]{3,8}$/i.test(hex)) {
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .split("")
            .map((channel) => channel + channel)
            .join("")
        : hex;
    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);
    const alpha =
      expanded.length === 8
        ? (Number.parseInt(expanded.slice(6, 8), 16) / 255) * opacity
        : opacity;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return color;
}

/**
 * Produces an outset shadow on every supported platform. Android 7–8 retain
 * elevation because outset `boxShadow` begins at Android 9 / API 28.
 */
export function createOutsetShadow({
  blurRadius,
  color,
  elevation,
  offsetY,
  opacity,
}: OutsetShadowOptions): ViewStyle {
  if (Platform.OS === "android" && Number(Platform.Version) < 28) {
    return { elevation };
  }

  return {
    boxShadow: `0px ${offsetY}px ${blurRadius}px ${toRgba(color, opacity)}`,
  };
}
