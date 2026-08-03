import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_OTP_INPUT_THEME,
  mergeOtpInputTheme,
} from './otpTheme.ts';

test('merges OTP provider colors without changing untouched defaults', () => {
  const theme = mergeOtpInputTheme(DEFAULT_OTP_INPUT_THEME, {
    colors: {
      cursor: '#C2410C',
      focus: '#28594A',
      surface: '#E8F0EC',
    },
  });

  assert.equal(theme.colors.focus, '#28594A');
  assert.equal(theme.colors.cursor, '#C2410C');
  assert.equal(theme.colors.surface, '#E8F0EC');
  assert.equal(theme.colors.placeholder, '#AAA69E');
  assert.equal(DEFAULT_OTP_INPUT_THEME.colors.focus, '#6558D9');
});

test('a nested OTP provider retains its parent colors', () => {
  const parentTheme = mergeOtpInputTheme(DEFAULT_OTP_INPUT_THEME, {
    colors: { focus: '#2563EB', separator: '#64748B' },
  });
  const nestedTheme = mergeOtpInputTheme(parentTheme, {
    colors: { cursor: '#C2410C' },
  });

  assert.equal(nestedTheme.colors.focus, '#2563EB');
  assert.equal(nestedTheme.colors.cursor, '#C2410C');
  assert.equal(nestedTheme.colors.separator, '#64748B');
});
