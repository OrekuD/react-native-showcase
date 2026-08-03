/** Resolves a value and maximum into a safe 0–1 progress fraction. */
export function resolveProgressValue(value: number, max: number): number {
  if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) return 0;

  return Math.min(Math.max(value / max, 0), 1);
}
