import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_CIRCULAR_PROGRESS_THEME,
  mergeCircularProgressTheme,
  type CircularProgressTheme,
  type ResolvedCircularProgressTheme,
} from "./circularProgressTheme";

/** Props accepted by {@link CircularProgressThemeProvider}. */
export type CircularProgressThemeProviderProps = {
  /** Circular progress roots rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest circular progress theme. */
  theme: CircularProgressTheme;
};

const CircularProgressThemeContext =
  createContext<ResolvedCircularProgressTheme>(
    DEFAULT_CIRCULAR_PROGRESS_THEME,
  );

/** Applies shared visual tokens to Skia circular progress rings in its subtree. */
export function CircularProgressThemeProvider({
  children,
  theme,
}: CircularProgressThemeProviderProps) {
  const parentTheme = useContext(CircularProgressThemeContext);
  const resolvedTheme = useMemo(
    () => mergeCircularProgressTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <CircularProgressThemeContext.Provider value={resolvedTheme}>
      {children}
    </CircularProgressThemeContext.Provider>
  );
}

/** Reads the closest resolved circular progress theme. */
export function useCircularProgressTheme() {
  return useContext(CircularProgressThemeContext);
}
