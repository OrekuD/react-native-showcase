import assert from "node:assert/strict";
import test from "node:test";

import { resolveProgressValue } from "./progressState.ts";

test("progress resolves to a normalized value between zero and one", () => {
  assert.equal(resolveProgressValue(25, 100), 0.25);
  assert.equal(resolveProgressValue(120, 100), 1);
  assert.equal(resolveProgressValue(-10, 100), 0);
});

test("progress safely resolves an invalid maximum to zero", () => {
  assert.equal(resolveProgressValue(25, 0), 0);
  assert.equal(resolveProgressValue(25, -100), 0);
});
