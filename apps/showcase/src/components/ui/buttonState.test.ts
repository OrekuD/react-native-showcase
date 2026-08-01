import { strict as assert } from 'node:assert';
import test from 'node:test';

import { resolveButtonState } from './buttonState.ts';

test('loading marks a button busy and prevents another press', () => {
  assert.deepEqual(resolveButtonState({ loading: true }), {
    accessibilityState: {
      busy: true,
      disabled: true,
    },
    isDisabled: true,
  });
});

test('the rendered disabled state overrides conflicting accessibility input', () => {
  assert.deepEqual(
    resolveButtonState({
      accessibilityState: {
        checked: true,
        disabled: true,
      },
      disabled: false,
      loading: false,
    }),
    {
      accessibilityState: {
        busy: false,
        checked: true,
        disabled: false,
      },
      isDisabled: false,
    },
  );
});
