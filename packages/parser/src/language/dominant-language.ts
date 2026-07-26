import { extensionFromPath, EXTENSION_TO_LANGUAGE } from "./extension-map.js";
import type { SupportedLanguage } from "./types.js";

/**
 * Determines the dominant language across a list of file paths by
 * majority vote over recognized extensions — used to fill
 * `WorkspaceContext.language` (Phase 18) for the whole project, as
 * opposed to `detectLanguage`'s single-file focus.
 */
export function detectDominantLanguage(
  filePaths: readonly string[]
): SupportedLanguage | undefined {
  const counts = new Map<SupportedLanguage, number>();

  for (const filePath of filePaths) {
    const extension = extensionFromPath(filePath);
    const language = extension ? EXTENSION_TO_LANGUAGE.get(extension) : undefined;
    if (language) {
      counts.set(language, (counts.get(language) ?? 0) + 1);
    }
  }

  let dominant: SupportedLanguage | undefined;
  let highestCount = 0;
  for (const [language, count] of counts) {
    if (count > highestCount) {
      dominant = language;
      highestCount = count;
    }
  }

  return dominant;
}
