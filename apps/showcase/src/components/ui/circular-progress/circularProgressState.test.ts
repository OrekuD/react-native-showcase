import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveCircularProgressArcGeometry,
  resolveCircularProgressRenderGeometry,
  resolveCircularProgressSegmentRanges,
  resolveCircularProgressValue,
  resolveCircularProgressSize,
} from "./circularProgressState.ts";

test("circular progress clamps values to the visible ring", () => {
  assert.equal(resolveCircularProgressValue(72, 100), 0.72);
  assert.equal(resolveCircularProgressValue(160, 100), 1);
  assert.equal(resolveCircularProgressValue(-2, 100), 0);
});

test("circular progress keeps the ring inside its canvas", () => {
  assert.equal(resolveCircularProgressSize(96, 12), 84);
  assert.equal(resolveCircularProgressSize(24, 20), 4);
  assert.equal(resolveCircularProgressSize(24, 28), 0);
});

test("a logical-pixel render inset keeps antialiasing inside the canvas", () => {
  const padding = 1;
  const geometry = resolveCircularProgressRenderGeometry(104, 12, padding);
  const outerRadius = geometry.pathRadius + 6;

  assert.equal(geometry.canvasSize, 104);
  assert.ok(Math.abs(geometry.center - outerRadius - padding) < 0.000_001);
  assert.ok(
    Math.abs(geometry.center + outerRadius - (104 - padding)) < 0.000_001,
  );
});

test("square arc layout preserves the requested diameter", () => {
  const geometry = resolveCircularProgressArcGeometry(
    180,
    14,
    1,
    180,
    180,
    "square",
  );

  assert.equal(geometry.canvasHeight, 180);
  assert.equal(geometry.canvasWidth, 180);
  assert.equal(geometry.centerX, 90);
  assert.equal(geometry.centerY, 90);
});

test("tight arc layout fits a semicircle without clipping its stroke", () => {
  const geometry = resolveCircularProgressArcGeometry(
    180,
    14,
    1,
    180,
    180,
    "tight",
  );

  assert.ok(Math.abs(geometry.canvasWidth - 180) < 0.000_001);
  assert.ok(Math.abs(geometry.canvasHeight - 98) < 0.000_001);
  assert.ok(Math.abs(geometry.centerX - 90) < 0.000_001);
  assert.ok(Math.abs(geometry.centerY - 90) < 0.000_001);
});

test("tight arc layout supports normalized start angles", () => {
  const negativeAngle = resolveCircularProgressArcGeometry(
    120,
    10,
    1,
    -180,
    180,
    "tight",
  );
  const positiveAngle = resolveCircularProgressArcGeometry(
    120,
    10,
    1,
    180,
    180,
    "tight",
  );

  assert.deepEqual(negativeAngle, positiveAngle);
});

test("segmented progress lays values sequentially across one arc", () => {
  const result = resolveCircularProgressSegmentRanges(
    [
      { id: "design", value: 30 },
      { id: "development", value: 20 },
      { id: "testing", value: 10 },
    ],
    100,
    180,
    0,
    "butt",
    12,
    70,
  );

  assert.equal(result.currentValue, 60);
  assert.deepEqual(result.ranges, [
    { end: 0.3, id: "design", start: 0 },
    { end: 0.5, id: "development", start: 0.3 },
    { end: 0.6, id: "testing", start: 0.5 },
  ]);
});

test("cumulative segments share one origin and paint largest values first", () => {
  const result = resolveCircularProgressSegmentRanges(
    [
      { id: "blue", value: 30 },
      { id: "yellow", value: 60 },
      { id: "red", value: 80 },
    ],
    100,
    360,
    0,
    "round",
    12,
    70,
    "cumulative",
  );

  assert.equal(result.currentValue, 80);
  assert.deepEqual(result.ranges, [
    { end: 0.8, id: "red", start: 0 },
    { end: 0.6, id: "yellow", start: 0 },
    { end: 0.3, id: "blue", start: 0 },
  ]);
});

test("cumulative segments validate each value instead of their combined total", () => {
  assert.doesNotThrow(() =>
    resolveCircularProgressSegmentRanges(
      [
        { id: "blue", value: 30 },
        { id: "yellow", value: 60 },
        { id: "red", value: 80 },
      ],
      100,
      360,
      0,
      "round",
      12,
      70,
      "cumulative",
    ),
  );
  assert.throws(
    () =>
      resolveCircularProgressSegmentRanges(
        [{ id: "overflow", value: 101 }],
        100,
        360,
        0,
        "round",
        12,
        70,
        "cumulative",
      ),
    /cannot exceed max/,
  );
});

test("round segment caps reserve enough path room for a visible gap", () => {
  const result = resolveCircularProgressSegmentRanges(
    [
      { id: "first", value: 50 },
      { id: "second", value: 50 },
    ],
    100,
    180,
    2,
    "round",
    12,
    70,
  );
  const [first, second] = result.ranges;

  assert.ok(first !== undefined);
  assert.ok(second !== undefined);
  assert.ok(second.start - first.end > 2 / 180);
});

test("segmented progress rejects ambiguous or impossible data", () => {
  assert.throws(
    () =>
      resolveCircularProgressSegmentRanges(
        [
          { id: "same", value: 20 },
          { id: "same", value: 30 },
        ],
        100,
        180,
        0,
        "butt",
        12,
        70,
      ),
    /unique ids/,
  );
  assert.throws(
    () =>
      resolveCircularProgressSegmentRanges(
        [
          { id: "first", value: 70 },
          { id: "second", value: 40 },
        ],
        100,
        180,
        0,
        "butt",
        12,
        70,
      ),
    /cannot exceed max/,
  );
});
