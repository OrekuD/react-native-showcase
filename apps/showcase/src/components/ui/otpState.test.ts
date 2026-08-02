import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_OTP_INPUT_SIZE,
  DEFAULT_OTP_INPUT_VARIANT,
  resolveOtpInputSize,
  resolveOtpInputVariant,
  shouldRenderInlineOtpGroups,
  shouldRenderOtpSeparator,
} from './otpState.ts';

test('outline is the default OTP treatment', () => {
  assert.equal(DEFAULT_OTP_INPUT_VARIANT, 'outline');
  assert.equal(resolveOtpInputVariant(), 'outline');
  assert.equal(resolveOtpInputVariant('filled'), 'filled');
  assert.equal(resolveOtpInputVariant('underline'), 'underline');
});

test('large is the default OTP size while small remains available', () => {
  assert.equal(DEFAULT_OTP_INPUT_SIZE, 'lg');
  assert.equal(resolveOtpInputSize(), 'lg');
  assert.equal(resolveOtpInputSize('sm'), 'sm');
});

test('a middle separator renders only for an even number of cells', () => {
  assert.equal(
    shouldRenderOtpSeparator({ numberOfDigits: 6, separator: true }),
    true,
  );
  assert.equal(
    shouldRenderOtpSeparator({ numberOfDigits: 5, separator: true }),
    false,
  );
  assert.equal(
    shouldRenderOtpSeparator({ numberOfDigits: 6 }),
    false,
  );
});

test('only a separated inline input renders two filled groups', () => {
  assert.equal(
    shouldRenderInlineOtpGroups({
      numberOfDigits: 6,
      separator: true,
      variant: 'inline',
    }),
    true,
  );
  assert.equal(
    shouldRenderInlineOtpGroups({
      numberOfDigits: 6,
      separator: true,
      variant: 'filled',
    }),
    false,
  );
});
