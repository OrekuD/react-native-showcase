import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  DEFAULT_BUTTON_THEME,
  mergeButtonTheme,
  resolveButtonTokens,
} from './buttonTheme.ts';

test('merges provider tokens without changing untouched defaults', () => {
  const theme = mergeButtonTheme(DEFAULT_BUTTON_THEME, {
    label: { fontSize: 17 },
    variants: {
      primary: { backgroundColor: '#2563EB' },
    },
  });

  assert.equal(theme.label.fontSize, 17);
  assert.equal(theme.label.fontWeight, '700');
  assert.equal(theme.variants.primary.backgroundColor, '#2563EB');
  assert.equal(theme.variants.primary.foregroundColor, '#FFFFFF');
  assert.equal(
    DEFAULT_BUTTON_THEME.variants.primary.backgroundColor,
    '#1D1D1B',
  );
});

test('per-button tokens override the provider for one button', () => {
  const theme = mergeButtonTheme(DEFAULT_BUTTON_THEME, {
    cornerSmoothing: 0.7,
    sizes: {
      md: { height: 54 },
    },
  });

  const tokens = resolveButtonTokens(theme, 'primary', 'md', {
    backgroundColor: '#0F766E',
    cornerSmoothing: 0.95,
    foregroundColor: '#ECFDF5',
    label: { fontSize: 18 },
    size: { height: 58, iconSize: 22 },
  });

  assert.deepEqual(tokens, {
    appearance: {
      backgroundColor: '#0F766E',
      borderColor: 'transparent',
      borderWidth: 0,
      foregroundColor: '#ECFDF5',
    },
    cornerSmoothing: 0.95,
    label: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    size: {
      height: 58,
      iconSize: 22,
      paddingHorizontal: 22,
    },
  });
});
