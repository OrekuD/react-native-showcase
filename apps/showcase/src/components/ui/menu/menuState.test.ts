import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveMenuMode,
} from "./menuState.ts";

test("custom menus resolve by default", () => {
  assert.equal(resolveMenuMode(undefined), "custom");
});

test("native menu mode remains explicit", () => {
  assert.equal(resolveMenuMode("native"), "native");
});
