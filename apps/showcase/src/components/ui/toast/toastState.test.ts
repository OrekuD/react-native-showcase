import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveToastPosition,
  resolveToastPresentationStack,
  resolveToastRepeatCount,
  resolveToastStack,
  resolveToastSwipeDirections,
  resolveToastTimeoutMs,
} from "./toastState.ts";

test("repeat feedback advances only for a visible matching toast", () => {
  assert.equal(resolveToastRepeatCount(0, true), 1);
  assert.equal(resolveToastRepeatCount(3, true), 4);
  assert.equal(resolveToastRepeatCount(3, false), 3);
});

test("toasts default to the bottom deck", () => {
  assert.equal(resolveToastPosition(), "bottom");
  assert.equal(resolveToastStack(), "deck");
});

test("toasts preserve explicit placement and stacking choices", () => {
  assert.equal(resolveToastPosition("top"), "top");
  assert.equal(resolveToastStack("vertical"), "vertical");
});

test("an expanded deck presents its notifications as a vertical stack", () => {
  assert.equal(resolveToastPresentationStack("deck", false), "deck");
  assert.equal(resolveToastPresentationStack("deck", true), "vertical");
  assert.equal(resolveToastPresentationStack("vertical", true), "vertical");
});

test("toasts dismiss horizontally by default and accept explicit directions", () => {
  assert.deepEqual(resolveToastSwipeDirections(), ["left", "right"]);
  assert.deepEqual(resolveToastSwipeDirections(["down", "up"]), ["down", "up"]);
  assert.deepEqual(resolveToastSwipeDirections([]), []);
});

test("toast durations use a five second default and allow persistent toasts", () => {
  assert.equal(resolveToastTimeoutMs(), 5_000);
  assert.equal(resolveToastTimeoutMs(2_500), 2_500);
  assert.equal(resolveToastTimeoutMs(null), null);
});
