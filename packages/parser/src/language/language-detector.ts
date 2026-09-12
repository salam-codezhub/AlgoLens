import { detectFromContentSignatures, detectFromShebang } from "./content-heuristics.js";
import {
  EXTENSION_TO_LANGUAGE,
  VSCODE_LANGUAGE_ID_MAP,
  extensionFromPath,
} from "./extension-map.js";
import type { DetectionInput, LanguageDetectionResult } from "./types.js";

/** ".h" is genuinely ambiguous — valid for both C and C++ — every other
 *  mapped extension is unambiguous. */
const AMBIGUOUS_EXTENSIONS = new Set(["h"]);

/**
 * Detects the language of a file from whichever signals are available,
 * in order of reliability:
 *   1. VS Code's own `languageId` (explicit, considers far more than we
 *      can from a filename alone) — confidence 95.
 *   2. File extension — confidence 90, or 60 for the one genuinely
 *      ambiguous extension (".h"), which then falls through to content
 *      signatures if `content` is available to disambiguate.
 *   3. Shebang line — confidence 85 (reliable when present, but only
 *      applies to Python/JS scripts, and only when there's no extension
 *      signal to use instead).
 *   4. Content syntax signatures — confidence scaled by how many distinct
 *      signatures matched (real corroborating evidence, not a guess).
 *   5. Unknown — confidence 0.
 */
export function detectLanguage(input: DetectionInput): LanguageDetectionResult {
  if (input.vscodeLanguageId) {
    const language = VSCODE_LANGUAGE_ID_MAP.get(input.vscodeLanguageId);
    if (language) {
      return { language, confidence: 95, method: "vscodeLanguageId" };
    }
  }

  const extension = input.filePath ? extensionFromPath(input.filePath) : undefined;
  if (extension) {
    const language = EXTENSION_TO_LANGUAGE.get(extension);
    if (language) {
      if (AMBIGUOUS_EXTENSIONS.has(extension) && input.content) {
        const signatureMatch = detectFromContentSignatures(input.content);
        if (
          signatureMatch &&
          (signatureMatch.language === "c" || signatureMatch.language === "cpp")
        ) {
          return {
            language: signatureMatch.language,
            confidence: Math.min(60 + signatureMatch.matchCount * 10, 90),
            method: "heuristic",
          };
        }
      }
      return {
        language,
        confidence: AMBIGUOUS_EXTENSIONS.has(extension) ? 60 : 90,
        method: "extension",
      };
    }
  }

  if (input.content) {
    const shebangLanguage = detectFromShebang(input.content);
    if (shebangLanguage) {
      return { language: shebangLanguage, confidence: 85, method: "shebang" };
    }

    const signatureMatch = detectFromContentSignatures(input.content);
    if (signatureMatch) {
      return {
        language: signatureMatch.language,
        confidence: Math.min(40 + signatureMatch.matchCount * 10, 75),
        method: "heuristic",
      };
    }
  }

  return { language: "unknown", confidence: 0, method: "unknown" };
}
