import type { OptimizationDiff } from "./types.js";

function createUnifiedDiff(before: string, after: string): string {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const diff: string[] = [];

  for (let index = 0; index < maxLines; index += 1) {
    const previous = beforeLines[index];
    const current = afterLines[index];

    if (previous === current) {
      diff.push(` ${previous ?? ""}`);
      continue;
    }

    if (previous !== undefined) {
      diff.push(`-${previous}`);
    }

    if (current !== undefined) {
      diff.push(`+${current}`);
    }
  }

  return diff.join("\n");
}

export function createOptimizationDiff(before: string, after: string): OptimizationDiff {
  return {
    before,
    after,
    unifiedDiff: createUnifiedDiff(before, after),
  };
}
