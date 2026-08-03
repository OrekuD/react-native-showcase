import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TOAST_THEME,
  mergeToastTheme,
  resolveToastTokens,
} from "./toastTheme.ts";

test("toast defaults use compact layout and typography", () => {
  assert.deepEqual(DEFAULT_TOAST_THEME.layout, {
    gap: 10,
    iconSize: 32,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  });
  assert.equal(DEFAULT_TOAST_THEME.label.fontSize, 15);
  assert.equal(DEFAULT_TOAST_THEME.label.lineHeight, 20);
  assert.equal(DEFAULT_TOAST_THEME.actionLabel.fontSize, 14);
});

test("provider theme changes shared toast sizing without dropping defaults", () => {
  const theme = mergeToastTheme(DEFAULT_TOAST_THEME, {
    backgroundColor: "#F8F7F4",
    borderRadius: 18,
    layout: { paddingHorizontal: 12 },
  });

  assert.equal(theme.surface.backgroundColor, "#F8F7F4");
  assert.equal(theme.borderRadius, 18);
  assert.equal(theme.layout.paddingHorizontal, 12);
  assert.equal(theme.layout.paddingVertical, 10);
});

test("one-off toast theme overrides the neutral default directly", () => {
  const tokens = resolveToastTokens(DEFAULT_TOAST_THEME, {
    backgroundColor: "#6558D9",
    borderRadius: 16,
    label: { fontSize: 14 },
  });

  assert.equal(tokens.surface.backgroundColor, "#6558D9");
  assert.equal(tokens.surface.labelColor, "#252522");
  assert.equal(tokens.borderRadius, 16);
  assert.equal(tokens.label.fontSize, 14);
  assert.equal(tokens.layout.minHeight, 64);
});
