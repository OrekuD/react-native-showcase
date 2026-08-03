import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_OTP_INPUT_THEME,
  mergeOtpInputTheme,
  type OtpInputTheme,
  type ResolvedOtpInputTheme,
} from './otpTheme';

/** Props accepted by {@link OtpInputThemeProvider}. */
export type OtpInputThemeProviderProps = {
  /** OTP inputs rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent OTP theme. */
  theme: OtpInputTheme;
};

const OtpInputThemeContext = createContext<ResolvedOtpInputTheme>(
  DEFAULT_OTP_INPUT_THEME,
);

/** Applies shared visual tokens to every {@link OtpInput} in its subtree. */
export function OtpInputThemeProvider({
  children,
  theme,
}: OtpInputThemeProviderProps) {
  const parentTheme = useContext(OtpInputThemeContext);
  const resolvedTheme = useMemo(
    () => mergeOtpInputTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <OtpInputThemeContext.Provider value={resolvedTheme}>
      {children}
    </OtpInputThemeContext.Provider>
  );
}

export function useOtpInputTheme() {
  return useContext(OtpInputThemeContext);
}
