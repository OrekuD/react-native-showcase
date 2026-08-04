import assert from "node:assert/strict";
import test from "node:test";

import {
  createNativeActionSheetOptions,
  isActionSheetCancellation,
  resolveActionSheetMode,
} from "./actionSheetState.ts";

const actions = [
  { id: "print", label: "Print task" },
  { disabled: true, id: "copy", label: "Copy link" },
  { destructive: true, id: "delete", label: "Delete task" },
] as const;

test("automatic mode uses native iOS and a custom sheet elsewhere", () => {
  assert.equal(resolveActionSheetMode(undefined, "ios"), "native");
  assert.equal(resolveActionSheetMode("automatic", "android"), "custom");
  assert.equal(resolveActionSheetMode("automatic", "web"), "custom");
});

test("custom mode remains available on every platform", () => {
  assert.equal(resolveActionSheetMode("custom", "ios"), "custom");
  assert.equal(resolveActionSheetMode("custom", "android"), "custom");
});

test("native options preserve action order and append one cancel action", () => {
  const result = createNativeActionSheetOptions({
    actions,
    cancelLabel: "Cancel",
    message: "Choose what to do with this task.",
    title: "Task actions",
  });

  assert.deepEqual(result.options, [
    "Print task",
    "Copy link",
    "Delete task",
    "Cancel",
  ]);
  assert.equal(result.cancelButtonIndex, 3);
  assert.deepEqual(result.destructiveButtonIndex, [2]);
  assert.deepEqual(result.disabledButtonIndices, [1]);
});

test("duplicate action ids fail before a sheet is presented", () => {
  assert.throws(
    () =>
      createNativeActionSheetOptions({
        actions: [
          { id: "copy", label: "Copy" },
          { id: "copy", label: "Copy again" },
        ],
      }),
    /unique id/i
  );
});

test("only an unclaimed custom dismissal is reported as cancellation", () => {
  assert.equal(isActionSheetCancellation(null), true);
  assert.equal(isActionSheetCancellation("programmatic"), false);
  assert.equal(isActionSheetCancellation("selection"), false);
});
