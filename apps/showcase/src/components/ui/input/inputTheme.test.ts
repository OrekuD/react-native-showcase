import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_INPUT_THEME,
  mergeInputTheme,
  resolveInputTokens,
} from './inputTheme.ts';

test('merges provider input tokens without changing untouched defaults', () => {
  const theme = mergeInputTheme(DEFAULT_INPUT_THEME, {
    colors: { focus: '#0F766E' },
    appearances: {
      filled: { borderRadius: 16 },
    },
    sizes: {
      md: { fieldHeight: 56 },
    },
  });

  assert.equal(theme.colors.focus, '#0F766E');
  assert.equal(theme.colors.error, '#B73C36');
  assert.equal(theme.appearances.filled.borderRadius, 16);
  assert.equal(theme.appearances.filled.backgroundColor, '#E7E9ED');
  assert.equal(theme.sizes.md.fieldHeight, 56);
  assert.equal(DEFAULT_INPUT_THEME.sizes.md.fieldHeight, 58);
});

test('per-input tokens override the provider for one input', () => {
  const providerTheme = mergeInputTheme(DEFAULT_INPUT_THEME, {
    colors: { focus: '#2563EB' },
    sizes: { md: { fieldHeight: 56 } },
  });
  const tokens = resolveInputTokens(providerTheme, 'filled', 'md', {
    appearance: { backgroundColor: '#F1F5F9', borderRadius: 14 },
    colors: { focus: '#C2415B' },
    cornerSmoothing: 0.9,
    size: { fieldHeight: 54 },
  });

  assert.equal(tokens.appearance.backgroundColor, '#F1F5F9');
  assert.equal(tokens.appearance.borderRadius, 14);
  assert.equal(tokens.appearance.borderWidth, 1.5);
  assert.equal(tokens.colors.focus, '#C2415B');
  assert.equal(tokens.colors.error, '#B73C36');
  assert.equal(tokens.cornerSmoothing, 0.9);
  assert.equal(tokens.size.fieldHeight, 54);
  assert.equal(tokens.size.iconSize, 18);
});

test('a nested provider overrides its parent without dropping inherited tokens', () => {
  const parentTheme = mergeInputTheme(DEFAULT_INPUT_THEME, {
    colors: { error: '#DC2626', focus: '#2563EB' },
    sizes: { md: { fieldHeight: 56 } },
  });
  const nestedTheme = mergeInputTheme(parentTheme, {
    colors: { focus: '#0F766E' },
  });

  assert.equal(nestedTheme.colors.focus, '#0F766E');
  assert.equal(nestedTheme.colors.error, '#DC2626');
  assert.equal(nestedTheme.sizes.md.fieldHeight, 56);
});
