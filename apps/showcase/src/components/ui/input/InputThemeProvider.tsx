import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_INPUT_THEME,
  mergeInputTheme,
  type InputTheme,
  type ResolvedInputTheme,
} from './inputTheme';

/** Props accepted by InputThemeProvider. */
export type InputThemeProviderProps = {
  /** Inputs rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent Input theme. */
  theme: InputTheme;
};

const InputThemeContext = createContext<ResolvedInputTheme>(
  DEFAULT_INPUT_THEME,
);

/** Applies shared Input tokens to every Input in its subtree. */
export function InputThemeProvider({
  children,
  theme,
}: InputThemeProviderProps) {
  const parentTheme = useContext(InputThemeContext);
  const resolvedTheme = useMemo(
    () => mergeInputTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <InputThemeContext.Provider value={resolvedTheme}>
      {children}
    </InputThemeContext.Provider>
  );
}

export function useInputTheme() {
  return useContext(InputThemeContext);
}
