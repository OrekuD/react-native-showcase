/** Chooses React Native's platform control or Showcase's custom switch. */
export type SwitchMode = 'custom' | 'native';

/** Visual treatments available when {@link SwitchMode} is `custom`. */
export type SwitchVariant = 'outline' | 'solid' | 'solid-tight';

/** Fixed measurements that distinguish each custom switch treatment. */
export type SwitchVariantLayout = {
  borderWidth: number;
  thumbInset: number;
  trackHeight: number;
  trackWidth: number;
};

/** Geometry for each custom switch treatment. */
export const SWITCH_VARIANT_LAYOUTS = {
  outline: {
    borderWidth: 2,
    thumbInset: 4,
    trackHeight: 34,
    trackWidth: 60,
  },
  solid: {
    borderWidth: 1,
    thumbInset: 4,
    trackHeight: 34,
    trackWidth: 60,
  },
  'solid-tight': {
    borderWidth: 1,
    thumbInset: 1.5,
    trackHeight: 34,
    trackWidth: 60,
  },
} as const satisfies Record<SwitchVariant, SwitchVariantLayout>;

/**
 * Resolves thumb dimensions from the track's inner content box so the visible
 * border and inset are equal on either side of the thumb.
 */
export function resolveSwitchThumbLayout(layout: SwitchVariantLayout) {
  const innerTrackHeight = layout.trackHeight - layout.borderWidth * 2;
  const innerTrackWidth = layout.trackWidth - layout.borderWidth * 2;
  const thumbSize = innerTrackHeight - layout.thumbInset * 2;

  return {
    thumbSize,
    thumbTravel: innerTrackWidth - thumbSize - layout.thumbInset * 2,
  };
}

/** Resolves the visual implementation while keeping the copyable control custom by default. */
export function resolveSwitchMode(mode: SwitchMode | undefined): SwitchMode {
  return mode ?? 'custom';
}

/** Resolves the standard filled custom treatment. */
export function resolveSwitchVariant(
  variant: SwitchVariant | undefined,
): SwitchVariant {
  return variant ?? 'solid';
}
