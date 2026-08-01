import type { PressableProps } from 'react-native';

type ResolveButtonStateOptions = Pick<
  PressableProps,
  'accessibilityState' | 'disabled'
> & {
  loading?: boolean;
};

export function resolveButtonState({
  accessibilityState,
  disabled = false,
  loading = false,
}: ResolveButtonStateOptions) {
  const isDisabled = Boolean(disabled || loading);

  return {
    accessibilityState: {
      ...accessibilityState,
      busy: loading,
      disabled: isDisabled,
    },
    isDisabled,
  };
}
