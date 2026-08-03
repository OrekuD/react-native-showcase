import assert from "node:assert/strict";
import test from "node:test";

import {
  isSelectValueSelected,
  resolveSelectMode,
} from "./selectState.ts";

test("custom select mode resolves by default", () => {
  assert.equal(resolveSelectMode(undefined), "custom");
  assert.equal(resolveSelectMode("native"), "native");
});

test("the selected value has one explicit source of truth", () => {
  assert.equal(isSelectValueSelected("personal", "personal"), true);
  assert.equal(isSelectValueSelected("personal", "team"), false);
});
