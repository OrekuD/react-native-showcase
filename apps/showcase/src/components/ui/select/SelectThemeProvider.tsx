import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_SELECT_THEME,
  mergeSelectTheme,
  type ResolvedSelectTheme,
  type SelectTheme,
} from "./selectTheme";

/** Props accepted by {@link SelectThemeProvider}. */
export type SelectThemeProviderProps = {
  /** Custom Select controls rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent select theme. */
  theme: SelectTheme;
};

const SelectThemeContext = createContext<ResolvedSelectTheme>(
  DEFAULT_SELECT_THEME
);

/** Applies shared visual tokens to custom Select controls in its subtree. */
export function SelectThemeProvider({
  children,
  theme,
}: SelectThemeProviderProps) {
  const parentTheme = useContext(SelectThemeContext);
  const resolvedTheme = useMemo(
    () => mergeSelectTheme(parentTheme, theme),
    [parentTheme, theme]
  );

  return (
    <SelectThemeContext.Provider value={resolvedTheme}>
      {children}
    </SelectThemeContext.Provider>
  );
}

export function useSelectTheme() {
  return useContext(SelectThemeContext);
}
