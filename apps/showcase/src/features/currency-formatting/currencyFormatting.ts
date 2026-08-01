export const CURRENCY_OPTIONS = [
  { code: 'USD', locale: 'en-US' },
  { code: 'EUR', locale: 'de-DE' },
  { code: 'GHS', locale: 'en-GH' },
] as const;

export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];

export type CounterState = {
  amount: number;
  currencyIndex: number;
};

const AMOUNT_STEP = 25;
const AMOUNT_VARIATIONS = 40_000;

export function createRandomCounterState(
  random: () => number = Math.random,
): CounterState {
  const amount = (Math.floor(random() * AMOUNT_VARIATIONS) + 1) * AMOUNT_STEP;
  const currencyIndex = Math.floor(random() * CURRENCY_OPTIONS.length);

  return { amount, currencyIndex };
}

export function formatCounterValue(
  amount: number,
  currency: CurrencyOption,
): string {
  return new Intl.NumberFormat(currency.locale, {
    currency: currency.code,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}
