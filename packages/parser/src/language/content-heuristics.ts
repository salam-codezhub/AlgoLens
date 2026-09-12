import type { SupportedLanguage } from "./types.js";

/** Matches a `#!` interpreter line, e.g. `#!/usr/bin/env python3`. */
export function detectFromShebang(content: string): SupportedLanguage | undefined {
  const firstLine = content.split("\n", 1)[0] ?? "";
  if (!firstLine.startsWith("#!")) {
    return undefined;
  }
  if (firstLine.includes("python")) {
    return "python";
  }
  if (/\bnode\b/.test(firstLine)) {
    return "javascript";
  }
  return undefined;
}

/**
 * Distinguishing syntax signatures per language, used to disambiguate when
 * the extension alone can't decide (e.g. a `.h` header, which is valid
 * for both C and C++; a file with no extension at all). Each pattern is a
 * real, meaningful syntactic marker for that language — not a guess.
 */
const SIGNATURES: Record<SupportedLanguage, readonly RegExp[]> = {
  python: [
    /^\s*def\s+\w+\s*\(.*\)\s*:/m,
    /^\s*import\s+\w+/m,
    /^\s*from\s+\w+\s+import\s/m,
    /:\s*$/m,
  ],
  java: [/^\s*package\s+[\w.]+;/m, /^\s*public\s+(final\s+)?class\s+\w+/m, /^\s*import\s+java\./m],
  cpp: [
    /#include\s*<(iostream|vector|string|map)>/,
    /\bstd::/,
    /^\s*template\s*</m,
    /^\s*namespace\s+\w+/m,
    /^\s*class\s+\w+/m,
  ],
  c: [/#include\s*<(stdio|stdlib|string)\.h>/, /^\s*int\s+main\s*\(\s*(void)?\s*\)/m],
  typescript: [
    /^\s*interface\s+\w+/m,
    /^\s*type\s+\w+\s*=/m,
    /:\s*(string|number|boolean|void|unknown)\b/,
    /^\s*export\s+type\b/m,
  ],
  javascript: [/\brequire\(/, /module\.exports/, /^\s*const\s+\w+\s*=\s*require/m],
};

/**
 * Scores each language by how many of its signature patterns match, and
 * returns the highest-scoring one, if any matched at all. Confidence
 * reflects how many distinct signatures matched, not a fixed number —
 * more corroborating signals genuinely means more confidence.
 */
export function detectFromContentSignatures(
  content: string
): { language: SupportedLanguage; matchCount: number } | undefined {
  let best: { language: SupportedLanguage; matchCount: number } | undefined;

  for (const [language, patterns] of Object.entries(SIGNATURES) as [
    SupportedLanguage,
    readonly RegExp[],
  ][]) {
    const matchCount = patterns.filter((pattern) => pattern.test(content)).length;
    if (matchCount > 0 && (!best || matchCount > best.matchCount)) {
      best = { language, matchCount };
    }
  }

  return best;
}
