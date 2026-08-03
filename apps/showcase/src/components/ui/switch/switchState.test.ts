import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveSwitchThumbLayout,
  resolveSwitchMode,
  resolveSwitchVariant,
  SWITCH_VARIANT_LAYOUTS,
} from './switchState.ts';
import {
  DEFAULT_SWITCH_THEME,
  mergeSwitchTheme,
  resolveSwitchTokens,
} from './switchTheme.ts';

test('custom solid is the default switch treatment', () => {
  assert.equal(resolveSwitchMode(undefined), 'custom');
  assert.equal(resolveSwitchVariant(undefined), 'solid');
  assert.equal(resolveSwitchMode('native'), 'native');
});

test('solid-tight has less track inset than solid', () => {
  assert.ok(
    SWITCH_VARIANT_LAYOUTS['solid-tight'].thumbInset <
      SWITCH_VARIANT_LAYOUTS.solid.thumbInset,
  );
});

test('thumbs use the inner bordered track bounds at both endpoints', () => {
  const layout = SWITCH_VARIANT_LAYOUTS.outline;
  const thumb = resolveSwitchThumbLayout(layout);
  const leadingSpace = layout.borderWidth + layout.thumbInset;
  const trailingSpace =
    layout.trackHeight - leadingSpace - thumb.thumbSize;

  assert.equal(leadingSpace, trailingSpace);
  assert.equal(thumb.thumbTravel, 26);
});

test('a local color override targets the rendered state without naming its variant', () => {
  const tokens = resolveSwitchTokens(DEFAULT_SWITCH_THEME, 'outline', {
    off: { borderColor: '#D1D5DB', thumbColor: '#A1A1AA' },
    on: { borderColor: '#8B5CF6', thumbColor: '#8B5CF6' },
  });

  assert.equal(tokens.on.borderColor, '#8B5CF6');
  assert.equal(tokens.on.thumbColor, '#8B5CF6');
  assert.equal(tokens.off.borderColor, '#D1D5DB');
  assert.equal(tokens.off.thumbColor, '#A1A1AA');
});

test('a nested provider retains its inherited colors', () => {
  const parentTheme = mergeSwitchTheme(DEFAULT_SWITCH_THEME, {
    on: { trackColor: '#00C853' },
  });
  const nestedTheme = mergeSwitchTheme(parentTheme, {
    on: { thumbColor: '#FFFFFF' },
  });

  assert.equal(nestedTheme.on.trackColor, '#00C853');
  assert.equal(nestedTheme.on.thumbColor, '#FFFFFF');
});
