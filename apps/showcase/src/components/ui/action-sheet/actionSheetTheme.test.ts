import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_ACTION_SHEET_THEME,
  mergeActionSheetTheme,
  resolveActionSheetTokens,
} from "./actionSheetTheme.ts";

test("the default custom sheet uses compact menu sizing", () => {
  assert.equal(DEFAULT_ACTION_SHEET_THEME.iconContainerSize, 36);
  assert.equal(DEFAULT_ACTION_SHEET_THEME.itemMinHeight, 48);
  assert.equal(DEFAULT_ACTION_SHEET_THEME.labelFontSize, 16);
});

test("nested providers preserve inherited action sheet tokens", () => {
  const parentTheme = mergeActionSheetTheme(DEFAULT_ACTION_SHEET_THEME, {
    backgroundColor: "#EEF4FF",
    labelColor: "#172B4D",
  });
  const nestedTheme = mergeActionSheetTheme(parentTheme, {
    iconBackgroundColor: "#DDEAFF",
  });

  assert.equal(nestedTheme.backgroundColor, "#EEF4FF");
  assert.equal(nestedTheme.labelColor, "#172B4D");
  assert.equal(nestedTheme.iconBackgroundColor, "#DDEAFF");
});

test("one sheet can override its provider without dropping defaults", () => {
  const tokens = resolveActionSheetTokens(DEFAULT_ACTION_SHEET_THEME, {
    borderRadius: 28,
    destructiveLabelColor: "#A33B2B",
  });

  assert.equal(tokens.borderRadius, 28);
  assert.equal(tokens.destructiveLabelColor, "#A33B2B");
  assert.equal(tokens.itemMinHeight, DEFAULT_ACTION_SHEET_THEME.itemMinHeight);
});

test("a sheet can use centered pill actions without changing its other defaults", () => {
  const tokens = resolveActionSheetTokens(DEFAULT_ACTION_SHEET_THEME, {
    actionGap: 14,
    itemBackgroundColor: "#E1E1E6",
    itemBorderRadius: 999,
    itemCornerSmoothing: 1,
    showHandle: false,
    textAlign: "center",
    titleFontSize: 24,
  });

  assert.equal(tokens.actionGap, 14);
  assert.equal(tokens.itemBackgroundColor, "#E1E1E6");
  assert.equal(tokens.itemBorderRadius, 999);
  assert.equal(tokens.itemCornerSmoothing, 1);
  assert.equal(tokens.showHandle, false);
  assert.equal(tokens.textAlign, "center");
  assert.equal(tokens.titleFontSize, 24);
  assert.equal(tokens.itemMinHeight, DEFAULT_ACTION_SHEET_THEME.itemMinHeight);
});
