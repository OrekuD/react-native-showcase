export type PopoverSide = "bottom" | "top";

type PopoverSideInput = {
  contentHeight: number | undefined;
  insetBottom?: number;
  insetTop?: number;
  triggerHeight: number | undefined;
  triggerY: number | undefined;
  viewportHeight: number;
};

/**
 * Chooses the side with the most usable space when a bottom popover would
 * collide with the lower viewport edge. The dropdown primitive then handles
 * the actual anchor position and any remaining collision clamping.
 */
export function resolvePopoverSide({
  contentHeight,
  insetBottom = 0,
  insetTop = 0,
  triggerHeight,
  triggerY,
  viewportHeight,
}: PopoverSideInput): PopoverSide {
  if (
    typeof contentHeight !== "number" ||
    typeof triggerHeight !== "number" ||
    typeof triggerY !== "number" ||
    !Number.isFinite(contentHeight) ||
    !Number.isFinite(triggerHeight) ||
    !Number.isFinite(triggerY) ||
    !Number.isFinite(viewportHeight)
  ) {
    return "bottom";
  }

  const spaceBelow =
    viewportHeight - insetBottom - (triggerY + triggerHeight);
  const spaceAbove = triggerY - insetTop;

  if (contentHeight > spaceBelow && spaceAbove > spaceBelow) {
    return "top";
  }

  return "bottom";
}
