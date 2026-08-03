import assert from "node:assert/strict";
import test from "node:test";

import { resolvePopoverSide } from "./popoverPosition.ts";

test("places a popover above a low trigger when it has more room there", () => {
  assert.equal(
    resolvePopoverSide({
      contentHeight: 260,
      insetBottom: 16,
      insetTop: 16,
      triggerHeight: 48,
      triggerY: 730,
      viewportHeight: 844,
    }),
    "top"
  );
});

test("keeps a popover below a trigger when the lower space fits", () => {
  assert.equal(
    resolvePopoverSide({
      contentHeight: 260,
      insetBottom: 16,
      insetTop: 16,
      triggerHeight: 48,
      triggerY: 120,
      viewportHeight: 844,
    }),
    "bottom"
  );
});

test("waits for content measurement before choosing a side", () => {
  assert.equal(
    resolvePopoverSide({
      contentHeight: undefined,
      triggerHeight: 48,
      triggerY: 730,
      viewportHeight: 844,
    }),
    "bottom"
  );
});
