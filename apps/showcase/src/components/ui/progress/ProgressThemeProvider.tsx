import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_PROGRESS_THEME,
  mergeProgressTheme,
  type ProgressTheme,
  type ResolvedProgressTheme,
} from "./progressTheme";

/** Props accepted by {@link ProgressThemeProvider}. */
export type ProgressThemeProviderProps = {
  /** Progress bars rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent progress theme. */
  theme: ProgressTheme;
};

const ProgressThemeContext = createContext<ResolvedProgressTheme>(
  DEFAULT_PROGRESS_THEME,
);

/** Applies shared visual tokens to linear progress controls in its subtree. */
export function ProgressThemeProvider({
  children,
  theme,
}: ProgressThemeProviderProps) {
  const parentTheme = useContext(ProgressThemeContext);
  const resolvedTheme = useMemo(
    () => mergeProgressTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <ProgressThemeContext.Provider value={resolvedTheme}>
      {children}
    </ProgressThemeContext.Provider>
  );
}

/** Reads the closest resolved linear progress theme. */
export function useProgressTheme() {
  return useContext(ProgressThemeContext);
}
