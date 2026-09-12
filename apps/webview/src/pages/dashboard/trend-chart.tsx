import type { ReactElement } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@algolens/ui";
import type { TrendChartData } from "./mock-data.js";

/**
 * One of the three trend charts from MASTER_04_UI_GUIDE.md's Dashboard
 * Layout > Charts. Colors reference the theme's CSS custom properties
 * directly (`var(--color-primary)`, etc.) rather than resolved hex values,
 * so the chart repaints correctly when the Theme Engine (Phase 11) switches
 * mode or accent color — recharts' SVG output accepts CSS custom
 * properties as ordinary presentation-attribute values in a real browser.
 */
export function TrendChart({ data }: { readonly data: TrendChartData }): ReactElement {
  return (
    <Card data-testid={`trend-chart-${data.id}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.points as unknown as Record<string, unknown>[]}>
            <defs>
              <linearGradient id={`gradient-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              width={40}
              unit={` ${data.unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              fill={`url(#gradient-${data.id})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
