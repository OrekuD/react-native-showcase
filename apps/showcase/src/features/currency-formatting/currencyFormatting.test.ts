import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  CURRENCY_OPTIONS,
  createRandomCounterState,
  formatCounterValue,
} from './currencyFormatting.ts';

test('formats a localized currency value for the rolling display', () => {
  const usd = CURRENCY_OPTIONS[0];

  assert.equal(formatCounterValue(12_450, usd), '$12,450');
});

test('randomizes between distinct currency options', () => {
  assert.deepEqual(
    CURRENCY_OPTIONS.map(({ code }) => code),
    ['USD', 'EUR', 'GHS'],
  );
});

test('creates the first supported value at the lower random boundary', () => {
  const state = createRandomCounterState(sequenceRandom([0, 0]));

  assert.deepEqual(state, { amount: 25, currencyIndex: 0 });
});

test('creates the highest supported value at the upper random boundary', () => {
  const state = createRandomCounterState(
    sequenceRandom([0.999_999, 0.999_999]),
  );

  assert.deepEqual(state, {
    amount: 1_000_000,
    currencyIndex: CURRENCY_OPTIONS.length - 1,
  });
});

function sequenceRandom(values: readonly number[]) {
  let index = 0;

  return () => {
    const value = values[index];
    index += 1;

    if (value === undefined) {
      throw new Error('Random sequence exhausted');
    }

    return value;
  };
}
