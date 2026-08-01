import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  CURRENCIES,
  createRandomCurrencyState,
} from './currencyFormatting.ts';

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

test('creates the lowest amount and first currency at the lower boundary', () => {
  const state = createRandomCurrencyState(sequenceRandom([0, 0]));

  assert.deepEqual(state, { amount: 1, currencyIndex: 0 });
});

test('creates the highest amount and last currency near the upper boundary', () => {
  const state = createRandomCurrencyState(
    sequenceRandom([0.999_999, 0.999_999]),
  );

  assert.deepEqual(state, {
    amount: 9_999,
    currencyIndex: CURRENCIES.length - 1,
  });
});

test('ships the three locale-aware currencies used by the reference', () => {
  assert.deepEqual(CURRENCIES, [
    { code: 'USD', locale: 'en-US', label: '$ USD' },
    { code: 'EUR', locale: 'de-DE', label: '€ EUR' },
    { code: 'JPY', locale: 'ja-JP', label: '¥ JPY' },
  ]);
});
