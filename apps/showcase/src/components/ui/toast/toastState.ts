/** Screen edge where a {@link ToastViewport} presents new notifications. */
export type ToastPosition = "bottom" | "top";

/** Arrangement used when more than one toast is visible. */
export type ToastStack = "deck" | "vertical";

/** Direction that can dismiss a toast with a swipe. */
export type ToastSwipeDirection = "down" | "left" | "right" | "up";

/** Default screen edge for {@link ToastProvider}. */
export const DEFAULT_TOAST_POSITION = "bottom" as const satisfies ToastPosition;

/** Default multi-toast arrangement for {@link ToastProvider}. */
export const DEFAULT_TOAST_STACK = "deck" as const satisfies ToastStack;

/** Default directions that dismiss a toast with a swipe. */
export const DEFAULT_TOAST_SWIPE_DIRECTIONS = [
  "left",
  "right",
] as const satisfies readonly ToastSwipeDirection[];

/** Default lifetime for a toast in milliseconds. */
export const DEFAULT_TOAST_TIMEOUT_MS = 5_000;

/** Resolves the viewport edge used when no explicit position is provided. */
export function resolveToastPosition(
  position?: ToastPosition,
): ToastPosition {
  return position ?? DEFAULT_TOAST_POSITION;
}

/** Resolves the multi-toast layout used when no explicit stack is provided. */
export function resolveToastStack(stack?: ToastStack): ToastStack {
  return stack ?? DEFAULT_TOAST_STACK;
}

/** Resolves the visible arrangement while a deck is temporarily expanded. */
export function resolveToastPresentationStack(
  stack: ToastStack,
  isDeckExpanded: boolean,
): ToastStack {
  return stack === "deck" && isDeckExpanded ? "vertical" : stack;
}

/** Advances the signal that drives feedback for a repeated visible toast. */
export function resolveToastRepeatCount(
  currentRepeatCount: number,
  hasVisibleMatch: boolean,
): number {
  return hasVisibleMatch ? currentRepeatCount + 1 : currentRepeatCount;
}

/** Resolves the directions that dismiss a toast when swiped. */
export function resolveToastSwipeDirections(
  directions?: readonly ToastSwipeDirection[],
): readonly ToastSwipeDirection[] {
  return directions ?? DEFAULT_TOAST_SWIPE_DIRECTIONS;
}

/**
 * Resolves the toast lifetime. Pass `null` to keep a toast visible until it is
 * dismissed by the user or application.
 */
export function resolveToastTimeoutMs(
  timeoutMs?: number | null,
): number | null {
  if (timeoutMs === null) return null;
  if (timeoutMs === undefined) return DEFAULT_TOAST_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw new RangeError("Toast durationMs must be a finite number greater than or equal to 0.");
  }

  return timeoutMs;
}
