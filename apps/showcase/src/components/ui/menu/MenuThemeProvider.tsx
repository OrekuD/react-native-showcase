import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_MENU_THEME,
  mergeMenuTheme,
  type MenuTheme,
  type ResolvedMenuTheme,
} from "./menuTheme";

/** Props accepted by {@link MenuThemeProvider}. */
export type MenuThemeProviderProps = {
  /** Custom menus rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent menu theme. */
  theme: MenuTheme;
};

const MenuThemeContext = createContext<ResolvedMenuTheme>(DEFAULT_MENU_THEME);

/** Applies shared visual tokens to custom Menu controls in its subtree. */
export function MenuThemeProvider({
  children,
  theme,
}: MenuThemeProviderProps) {
  const parentTheme = useContext(MenuThemeContext);
  const resolvedTheme = useMemo(
    () => mergeMenuTheme(parentTheme, theme),
    [parentTheme, theme]
  );

  return (
    <MenuThemeContext.Provider value={resolvedTheme}>
      {children}
    </MenuThemeContext.Provider>
  );
}

export function useMenuTheme() {
  return useContext(MenuThemeContext);
}
