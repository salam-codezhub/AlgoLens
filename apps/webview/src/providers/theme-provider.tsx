import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type ThemeMode = "dark" | "light" | "auto";
export type ResolvedTheme = "dark" | "light";
export type AccentColor = "blue" | "purple" | "green" | "amber" | "rose";

export interface ThemeState {
  /** The user's chosen mode — may be "auto", which tracks the OS preference. */
  readonly themeMode: ThemeMode;
  /** The actual applied theme ("auto" always resolves to "dark" or "light"). */
  readonly resolvedTheme: ResolvedTheme;
  readonly accentColor: AccentColor;
  readonly setThemeMode: (mode: ThemeMode) => void;
  readonly setAccentColor: (accent: AccentColor) => void;
}

const THEME_MODE_STORAGE_KEY = "algolens.themeMode";
const ACCENT_COLOR_STORAGE_KEY = "algolens.accentColor";

const THEME_MODES: readonly ThemeMode[] = ["dark", "light", "auto"];
const ACCENT_COLORS: readonly AccentColor[] = ["blue", "purple", "green", "amber", "rose"];

const ThemeContext = createContext<ThemeState | undefined>(undefined);

function readStoredValue<T extends string>(key: string, allowed: readonly T[]): T | undefined {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : undefined;
  } catch {
    // localStorage can throw in restrictive/embedded environments (e.g. a
    // webview with storage disabled) — fall back to defaults rather than
    // crashing the whole app over a preference.
    return undefined;
  }
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "auto" ? getSystemTheme() : mode;
}

/**
 * Provides theme state (mode, resolved theme, accent color) and applies the
 * corresponding `.dark`/`.light` class and `data-accent` attribute to
 * `<html>`, matching the selectors defined in styles.css.
 *
 * Persists preferences to `localStorage` — appropriate here since this is a
 * real running webview app, not a sandboxed artifact. Full persistence via
 * VS Code's own `globalState` (surviving webview disposal, syncing across
 * windows) needs the extension-host message-passing bridge, which doesn't
 * exist yet; `localStorage` is a genuine, working default until then, not a
 * placeholder.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => readStoredValue(THEME_MODE_STORAGE_KEY, THEME_MODES) ?? "dark"
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => readStoredValue(ACCENT_COLOR_STORAGE_KEY, ACCENT_COLORS) ?? "blue"
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(themeMode));

  useEffect(() => {
    setResolvedTheme(resolveTheme(themeMode));

    if (themeMode !== "auto") {
      return;
    }

    const query = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (): void => {
      setResolvedTheme(resolveTheme("auto"));
    };
    query.addEventListener("change", handleChange);
    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch {
      // See readStoredValue — storage may be unavailable; the in-memory
      // state above still works for the current session.
    }
  }, []);

  const setAccentColor = useCallback((accent: AccentColor) => {
    setAccentColorState(accent);
    try {
      window.localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accent);
    } catch {
      // See readStoredValue.
    }
  }, []);

  const value: ThemeState = { themeMode, resolvedTheme, accentColor, setThemeMode, setAccentColor };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads the current {@link ThemeState}. Must be used within a {@link ThemeProvider}. */
export function useTheme(): ThemeState {
  const state = useContext(ThemeContext);
  if (!state) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return state;
}
