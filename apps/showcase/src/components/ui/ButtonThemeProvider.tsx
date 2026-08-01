import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_BUTTON_THEME,
  mergeButtonTheme,
  type ButtonTheme,
  type ResolvedButtonTheme,
} from './buttonTheme';

/** Props accepted by ButtonThemeProvider. */
export type ButtonThemeProviderProps = {
  /** Buttons rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent button theme. */
  theme: ButtonTheme;
};

const ButtonThemeContext = createContext<ResolvedButtonTheme>(
  DEFAULT_BUTTON_THEME,
);

/** Applies shared button tokens to every Button in its subtree. */
export function ButtonThemeProvider({
  children,
  theme,
}: ButtonThemeProviderProps) {
  const parentTheme = useContext(ButtonThemeContext);
  const resolvedTheme = useMemo(
    () => mergeButtonTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <ButtonThemeContext.Provider value={resolvedTheme}>
      {children}
    </ButtonThemeContext.Provider>
  );
}

export function useButtonTheme() {
  return useContext(ButtonThemeContext);
}
