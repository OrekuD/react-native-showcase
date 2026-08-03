import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_SWITCH_THEME,
  mergeSwitchTheme,
  type ResolvedSwitchTheme,
  type SwitchTheme,
} from './switchTheme';

/** Props accepted by {@link SwitchThemeProvider}. */
export type SwitchThemeProviderProps = {
  /** Switches rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial on/off colors merged with the closest parent switch theme. */
  theme: SwitchTheme;
};

const SwitchThemeContext = createContext<ResolvedSwitchTheme>(
  DEFAULT_SWITCH_THEME,
);

/** Applies shared colors to native and custom Switch controls in its subtree. */
export function SwitchThemeProvider({
  children,
  theme,
}: SwitchThemeProviderProps) {
  const parentTheme = useContext(SwitchThemeContext);
  const resolvedTheme = useMemo(
    () => mergeSwitchTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <SwitchThemeContext.Provider value={resolvedTheme}>
      {children}
    </SwitchThemeContext.Provider>
  );
}

export function useSwitchTheme() {
  return useContext(SwitchThemeContext);
}
