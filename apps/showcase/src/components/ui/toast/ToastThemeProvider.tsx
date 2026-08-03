import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_TOAST_THEME,
  mergeToastTheme,
  type ResolvedToastTheme,
  type ToastTheme,
} from "./toastTheme";

/** Props accepted by {@link ToastThemeProvider}. */
export type ToastThemeProviderProps = {
  /** Toast providers and viewports rendered inside the themed subtree. */
  children: ReactNode;
  /** Partial tokens merged with the closest parent toast theme. */
  theme: ToastTheme;
};

const ToastThemeContext = createContext<ResolvedToastTheme>(DEFAULT_TOAST_THEME);

/** Applies shared visual tokens to toast providers in its subtree. */
export function ToastThemeProvider({
  children,
  theme,
}: ToastThemeProviderProps) {
  const parentTheme = useContext(ToastThemeContext);
  const resolvedTheme = useMemo(
    () => mergeToastTheme(parentTheme, theme),
    [parentTheme, theme],
  );

  return (
    <ToastThemeContext.Provider value={resolvedTheme}>
      {children}
    </ToastThemeContext.Provider>
  );
}

/** Reads the closest resolved toast theme. */
export function useToastTheme() {
  return useContext(ToastThemeContext);
}
