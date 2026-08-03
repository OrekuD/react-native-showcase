/** Resolves a value and maximum into a safe 0–1 circular progress fraction. */
export function resolveCircularProgressValue(
  value: number,
  max: number,
): number {
  if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) return 0;

  return Math.min(Math.max(value / max, 0), 1);
}

/** Resolves the drawable ring diameter inside a circular progress canvas. */
export function resolveCircularProgressSize(
  size: number,
  ringSize: number,
): number {
  if (!Number.isFinite(size) || !Number.isFinite(ringSize)) return 0;

  return Math.max(0, size - ringSize);
}

/** Geometry for a ring rendered inside Skia's antialias-safe drawing bounds. */
export type CircularProgressRenderGeometry = {
  canvasSize: number;
  center: number;
  pathRadius: number;
};

/** Layout bounds used when rendering a partial circular-progress arc. */
export type CircularProgressArcLayout = "square" | "tight";

/** Geometry for a circular-progress arc and its antialias-safe canvas. */
export type CircularProgressArcGeometry = {
  canvasHeight: number;
  canvasWidth: number;
  centerX: number;
  centerY: number;
  pathRadius: number;
};

type CircularProgressSegmentValue = {
  id: string;
  value: number;
};

type CircularProgressSegmentRange = {
  end: number;
  id: string;
  start: number;
};

type CircularProgressSegmentRangeResult = {
  currentValue: number;
  ranges: CircularProgressSegmentRange[];
};

type CircularProgressSegmentStrokeCap = "butt" | "round" | "square";

export type CircularProgressSegmentMode = "cumulative" | "sequential";

/**
 * Keeps a ring's antialiased stroke inside its Canvas. `renderPadding` is
 * normally one logical device pixel and is internal to the requested size.
 */
export function resolveCircularProgressRenderGeometry(
  size: number,
  thickness: number,
  renderPadding: number,
): CircularProgressRenderGeometry {
  const safePadding =
    Number.isFinite(renderPadding) && renderPadding > 0 ? renderPadding : 0;

  return {
    canvasSize: size,
    center: size / 2,
    pathRadius: Math.max(
      0,
      resolveCircularProgressSize(size, thickness) / 2 - safePadding,
    ),
  };
}

const CARDINAL_ANGLES = [0, 90, 180, 270] as const;

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function isAngleInSweep(
  angle: number,
  startAngle: number,
  sweepAngle: number,
): boolean {
  const offset = normalizeAngle(angle - startAngle);
  return offset <= sweepAngle + Number.EPSILON;
}

/**
 * Resolves either the requested square bounds or the smallest safe bounds for
 * a clockwise arc. Tight bounds include the complete stroke and its
 * antialiasing inset.
 */
export function resolveCircularProgressArcGeometry(
  size: number,
  thickness: number,
  renderPadding: number,
  startAngle: number,
  sweepAngle: number,
  arcLayout: CircularProgressArcLayout,
): CircularProgressArcGeometry {
  const ring = resolveCircularProgressRenderGeometry(
    size,
    thickness,
    renderPadding,
  );

  if (arcLayout === "square" || sweepAngle >= 360) {
    return {
      canvasHeight: ring.canvasSize,
      canvasWidth: ring.canvasSize,
      centerX: ring.center,
      centerY: ring.center,
      pathRadius: ring.pathRadius,
    };
  }

  const normalizedStartAngle = normalizeAngle(startAngle);
  const includedAngles = [
    normalizedStartAngle,
    normalizedStartAngle + sweepAngle,
    ...CARDINAL_ANGLES.filter((angle) =>
      isAngleInSweep(angle, normalizedStartAngle, sweepAngle),
    ),
  ];
  const points = includedAngles.map((angle) => {
    const radians = (angle * Math.PI) / 180;

    return {
      x: ring.center + ring.pathRadius * Math.cos(radians),
      y: ring.center + ring.pathRadius * Math.sin(radians),
    };
  });
  const minimumX = Math.min(...points.map(({ x }) => x));
  const maximumX = Math.max(...points.map(({ x }) => x));
  const minimumY = Math.min(...points.map(({ y }) => y));
  const maximumY = Math.max(...points.map(({ y }) => y));
  const safePadding =
    Number.isFinite(renderPadding) && renderPadding > 0 ? renderPadding : 0;
  const paintInset = thickness / 2 + safePadding;

  return {
    canvasHeight: maximumY - minimumY + paintInset * 2,
    canvasWidth: maximumX - minimumX + paintInset * 2,
    centerX: ring.center - minimumX + paintInset,
    centerY: ring.center - minimumY + paintInset,
    pathRadius: ring.pathRadius,
  };
}

function resolveSegmentCapAngle(
  strokeCap: CircularProgressSegmentStrokeCap,
  thickness: number,
  pathRadius: number,
): number {
  if (strokeCap === "butt" || pathRadius <= 0) return 0;

  const capRadiusRatio = Math.min(
    Math.max(thickness / 2 / pathRadius, 0),
    1,
  );

  return (Math.asin(capRadiusRatio) * 180) / Math.PI;
}

/**
 * Resolves ordered segment values into non-overlapping path fractions. For
 * round and square caps, the centerline gap also accounts for the paint that
 * extends beyond each path endpoint.
 */
export function resolveCircularProgressSegmentRanges(
  segments: readonly CircularProgressSegmentValue[],
  max: number,
  sweepAngle: number,
  segmentGapAngle: number,
  strokeCap: CircularProgressSegmentStrokeCap,
  thickness: number,
  pathRadius: number,
  segmentMode: CircularProgressSegmentMode = "sequential",
): CircularProgressSegmentRangeResult {
  if (segments.length === 0) {
    throw new RangeError(
      "CircularProgress segments must contain at least one segment.",
    );
  }
  if (!Number.isFinite(max) || max <= 0) {
    throw new RangeError("CircularProgress max must be a positive finite number.");
  }
  if (!Number.isFinite(segmentGapAngle) || segmentGapAngle < 0) {
    throw new RangeError(
      "CircularProgress segmentGapAngle must be a finite number greater than or equal to 0.",
    );
  }

  const ids = segments.map(({ id }) => id);
  if (ids.some((id) => id.trim().length === 0)) {
    throw new TypeError("CircularProgress segment ids must not be empty.");
  }
  if (new Set(ids).size !== ids.length) {
    throw new TypeError("CircularProgress segments must have unique ids.");
  }
  if (segments.some(({ value }) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError(
      "CircularProgress segment values must be finite numbers greater than or equal to 0.",
    );
  }

  const currentValue =
    segmentMode === "cumulative"
      ? Math.max(...segments.map(({ value }) => value))
      : segments.reduce((total, segment) => total + segment.value, 0);
  if (currentValue > max) {
    throw new RangeError(
      segmentMode === "cumulative"
        ? "CircularProgress cumulative segment values cannot exceed max."
        : "CircularProgress segment values cannot exceed max when combined.",
    );
  }

  const visibleSegments = segments.filter(({ value }) => value > 0);
  if (segmentMode === "cumulative") {
    const ranges = [...visibleSegments]
      .sort((left, right) => right.value - left.value)
      .map(({ id, value }) => ({ end: value / max, id, start: 0 }));

    return { currentValue, ranges };
  }

  const capAngle = resolveSegmentCapAngle(strokeCap, thickness, pathRadius);
  const pathGapFraction =
    (segmentGapAngle + capAngle * 2) / sweepAngle;
  const result = visibleSegments.reduce<{
    offset: number;
    ranges: CircularProgressSegmentRange[];
  }>(
    ({ offset, ranges }, segment, index) => {
      const isFirst = index === 0;
      const isLast = index === visibleSegments.length - 1;
      const start = offset / max + (isFirst ? 0 : pathGapFraction / 2);
      const end =
        (offset + segment.value) / max -
        (isLast ? 0 : pathGapFraction / 2);

      if (end <= start) {
        throw new RangeError(
          `CircularProgress segment "${segment.id}" is too small for the configured segment gap and stroke cap.`,
        );
      }

      return {
        offset: offset + segment.value,
        ranges: [...ranges, { end, id: segment.id, start }],
      };
    },
    { offset: 0, ranges: [] },
  );

  return { currentValue, ranges: result.ranges };
}
