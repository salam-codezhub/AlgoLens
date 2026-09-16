import type { CodePatch, ModificationPreview } from "./types.js";

function createUnifiedDiff(before: string, after: string): string {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const diff: string[] = [];

  const maxLines = Math.max(beforeLines.length, afterLines.length);

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

export function generatePatch(before: string, after: string): CodePatch {
  return {
    before,
    after,
    unifiedDiff: createUnifiedDiff(before, after),
  };
}

export function previewModification(
  before: string,
  after: string,
  syntaxLanguage?: string
): ModificationPreview {
  const patch = generatePatch(before, after);

  return syntaxLanguage === undefined
    ? {
        patch,
        status: "preview",
      }
    : {
        patch,
        status: "preview",
        syntaxLanguage,
      };
}
