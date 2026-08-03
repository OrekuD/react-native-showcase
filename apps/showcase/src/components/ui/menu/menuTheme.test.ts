import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MENU_THEME,
  mergeMenuTheme,
  resolveMenuTokens,
} from "./menuTheme.ts";

test("a nested menu provider keeps inherited tokens", () => {
  const parentTheme = mergeMenuTheme(DEFAULT_MENU_THEME, {
    backgroundColor: "#EEF4FF",
    labelColor: "#182033",
  });
  const nestedTheme = mergeMenuTheme(parentTheme, {
    sectionLabelColor: "#6558D9",
  });

  assert.equal(nestedTheme.backgroundColor, "#EEF4FF");
  assert.equal(nestedTheme.labelColor, "#182033");
  assert.equal(nestedTheme.sectionLabelColor, "#6558D9");
});

test("a local menu theme overrides only the selected custom menu", () => {
  const tokens = resolveMenuTokens(DEFAULT_MENU_THEME, {
    destructiveLabelColor: "#B42318",
    iconBackgroundColor: "#F2E8E7",
  });

  assert.equal(tokens.destructiveLabelColor, "#B42318");
  assert.equal(tokens.iconBackgroundColor, "#F2E8E7");
  assert.equal(tokens.backgroundColor, DEFAULT_MENU_THEME.backgroundColor);
});
