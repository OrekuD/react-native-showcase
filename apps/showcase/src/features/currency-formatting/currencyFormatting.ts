export const CURRENCIES = [
  { code: 'USD', locale: 'en-US', label: '$ USD' },
  { code: 'EUR', locale: 'de-DE', label: '€ EUR' },
  { code: 'JPY', locale: 'ja-JP', label: '¥ JPY' },
] as const;

export type CurrencyState = {
  amount: number;
  currencyIndex: number;
};

export function createRandomCurrencyState(
  random: () => number = Math.random,
): CurrencyState {
  const amount = Math.floor(random() * 9_999) + 1;
  const currencyIndex = Math.floor(random() * CURRENCIES.length);

  return { amount, currencyIndex };
}
