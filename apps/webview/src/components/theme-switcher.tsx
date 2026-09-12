import type { ReactElement } from "react";
import { Button } from "@algolens/ui";
import { useTheme, type AccentColor, type ThemeMode } from "../providers/theme-provider.js";

const THEME_MODE_OPTIONS: readonly { readonly mode: ThemeMode; readonly label: string }[] = [
  { mode: "dark", label: "Dark" },
  { mode: "light", label: "Light" },
  { mode: "auto", label: "Auto" },
];

const ACCENT_COLOR_OPTIONS: readonly {
  readonly color: AccentColor;
  readonly swatchClass: string;
}[] = [
  { color: "blue", swatchClass: "bg-[#3e8eff]" },
  { color: "purple", swatchClass: "bg-[#a855f7]" },
  { color: "green", swatchClass: "bg-[#22c55e]" },
  { color: "amber", swatchClass: "bg-[#f59e0b]" },
  { color: "rose", swatchClass: "bg-[#ef4444]" },
];

/**
 * Real theme controls: mode (Dark/Light/Auto) and accent color. Every
 * button here calls straight into {@link useTheme}, which applies the
 * `.dark`/`.light` class and `data-accent` attribute to `<html>` per
 * styles.css's selectors — this component doesn't do any styling itself,
 * it only drives the theme state.
 */
export function ThemeSwitcher(): ReactElement {
  const { themeMode, resolvedTheme, accentColor, setThemeMode, setAccentColor } = useTheme();

  return (
    <div className="flex flex-col gap-3" data-testid="theme-switcher">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Theme:</span>
        {THEME_MODE_OPTIONS.map(({ mode, label }) => (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={themeMode === mode ? "default" : "outline"}
            aria-pressed={themeMode === mode}
            onClick={() => {
              setThemeMode(mode);
            }}
          >
            {label}
          </Button>
        ))}
        <span className="text-muted-foreground text-xs" data-testid="resolved-theme">
          (resolved: {resolvedTheme})
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Accent:</span>
        {ACCENT_COLOR_OPTIONS.map(({ color, swatchClass }) => (
          <button
            key={color}
            type="button"
            aria-label={`${color} accent`}
            aria-pressed={accentColor === color}
            data-testid={`accent-${color}`}
            onClick={() => {
              setAccentColor(color);
            }}
            className={`h-6 w-6 rounded-full ${swatchClass} ${
              accentColor === color ? "ring-ring ring-2 ring-offset-2" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
