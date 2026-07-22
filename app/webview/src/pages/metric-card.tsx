import type { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@algolens/ui";
import type { ScoreCardData } from "./mock-data.js";

/** One of the six score cards from MASTER_04_UI_GUIDE.md's Dashboard Layout > Cards. */
export function MetricCard({ data }: { readonly data: ScoreCardData }): ReactElement {
  return (
    <Card data-testid={`metric-card-${data.id}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{data.value}</p>
        <CardDescription>{data.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
