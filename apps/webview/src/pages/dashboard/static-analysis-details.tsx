import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@algolens/ui";
import type { StaticAnalysisResult } from "@algolens/analyzer";

function DetailList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}): ReactElement {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">None detected</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item} className="truncate">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StaticAnalysisDetails({
  analysis,
}: {
  readonly analysis: StaticAnalysisResult;
}): ReactElement {
  const deadCodeItems = analysis.deadCode.map(
    (location) =>
      `${location.afterStatementType}: ${String(location.unreachableStatementCount)} unreachable`
  );

  const complexityItems = analysis.functionComplexity.map(
    (functionInfo) => `${functionInfo.name}: ${String(functionInfo.cyclomaticComplexity)}`
  );

  return (
    <Card data-testid="static-analysis-details">
      <CardHeader>
        <CardTitle>Static Analysis Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DetailList
            title="Unused Imports"
            items={analysis.unusedImports.map((item) => item.name)}
          />
          <DetailList
            title="Unused Variables"
            items={analysis.unusedVariables.map((item) => item.name)}
          />
          <DetailList title="Dead Code" items={deadCodeItems} />
          <DetailList title="Recursive Functions" items={analysis.recursiveFunctions} />
          <DetailList title="Function Complexity" items={complexityItems} />
          <DetailList title="Detected Imports" items={analysis.imports} />
        </div>
      </CardContent>
    </Card>
  );
}
