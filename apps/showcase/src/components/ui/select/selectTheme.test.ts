import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SELECT_THEME,
  mergeSelectTheme,
  resolveSelectTokens,
} from "./selectTheme.ts";

test("a nested select provider keeps inherited tokens", () => {
  const parentTheme = mergeSelectTheme(DEFAULT_SELECT_THEME, {
    backgroundColor: "#EEF4FF",
    labelColor: "#182033",
  });
  const nestedTheme = mergeSelectTheme(parentTheme, {
    checkmarkColor: "#6558D9",
  });

  assert.equal(nestedTheme.backgroundColor, "#EEF4FF");
  assert.equal(nestedTheme.labelColor, "#182033");
  assert.equal(nestedTheme.checkmarkColor, "#6558D9");
});

test("a local select theme overrides only the selected custom control", () => {
  const tokens = resolveSelectTokens(DEFAULT_SELECT_THEME, {
    checkmarkColor: "#1256A3",
    iconBackgroundColor: "#E1EDFF",
  });

  assert.equal(tokens.checkmarkColor, "#1256A3");
  assert.equal(tokens.iconBackgroundColor, "#E1EDFF");
  assert.equal(tokens.backgroundColor, DEFAULT_SELECT_THEME.backgroundColor);
});
