import type { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@algolens/ui";
import { ThemeSwitcher } from "../components/theme-switcher.js";

/**
 * Settings: "AI provider configuration, preferences, and extension
 * settings" per MASTER_04_UI_GUIDE.md. Only the Appearance section
 * (Phase 11's theme controls) is real today — AI provider configuration
 * arrives with the AI Provider Architecture (Phase 16).
 */
export function Settings(): ReactElement {
  return (
    <div className="flex max-w-xl flex-col gap-4" data-testid="settings">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme mode and accent color.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}
