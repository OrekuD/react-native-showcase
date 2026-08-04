import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  DEFAULT_ACTION_SHEET_THEME,
  mergeActionSheetTheme,
  type ActionSheetTheme,
  type ResolvedActionSheetTheme,
} from "./actionSheetTheme";

export type ActionSheetThemeProviderProps = {
  children: ReactNode;
  theme: ActionSheetTheme;
};

const ActionSheetThemeContext = createContext<ResolvedActionSheetTheme>(
  DEFAULT_ACTION_SHEET_THEME
);

export function ActionSheetThemeProvider({
  children,
  theme,
}: ActionSheetThemeProviderProps) {
  const parentTheme = useContext(ActionSheetThemeContext);
  const resolvedTheme = useMemo(
    () => mergeActionSheetTheme(parentTheme, theme),
    [parentTheme, theme]
  );

  return (
    <ActionSheetThemeContext.Provider value={resolvedTheme}>
      {children}
    </ActionSheetThemeContext.Provider>
  );
}

export function useActionSheetTheme() {
  return useContext(ActionSheetThemeContext);
}
