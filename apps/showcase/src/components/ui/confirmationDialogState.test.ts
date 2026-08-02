import assert from "node:assert/strict";
import test from "node:test";

import {
  getConfirmationDialogButtons,
  resolveConfirmationDialogMode,
} from "./confirmationDialogState.ts";

test("custom dialogs are the default while native remains explicit", () => {
  assert.equal(resolveConfirmationDialogMode(undefined), "custom");
  assert.equal(resolveConfirmationDialogMode("custom"), "custom");
  assert.equal(resolveConfirmationDialogMode("native"), "native");
});

test("confirmation options create a cancel action before the confirmation action", () => {
  const onCancel = () => undefined;
  const onConfirm = () => undefined;

  assert.deepEqual(
    getConfirmationDialogButtons({
      cancelLabel: "Keep editing",
      confirmLabel: "Discard changes",
      destructive: true,
      onCancel,
      onConfirm,
      title: "Discard changes?",
    }),
    [
      { onPress: onCancel, style: "cancel", text: "Keep editing" },
      {
        onPress: onConfirm,
        style: "destructive",
        text: "Discard changes",
      },
    ]
  );
});

test("confirmation options can omit the cancel action", () => {
  assert.deepEqual(
    getConfirmationDialogButtons({
      confirmLabel: "Continue",
      title: "Continue?",
    }),
    [{ onPress: undefined, style: "default", text: "Continue" }]
  );
});
