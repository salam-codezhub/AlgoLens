import type { AlgorithmDetectionContext } from "./types.js";

/** Splits identifiers on camelCase transitions and underscores so keyword
 *  matching can use real word boundaries — `windowSum` becomes
 *  `window Sum`, `greedy_coin_change` becomes `greedy coin change` — while
 *  `append` (no internal case transition or underscore) stays `append`
 *  as one word, so a keyword like "end" correctly does *not* match inside
 *  it. Neither a strict `\bkeyword\b` regex against the raw code (fails
 *  on `windowSum`/`greedy_coin_change`, where no non-word character
 *  separates the keyword from the rest of the identifier) nor plain
 *  substring matching (`"end"` matching inside `"append"`) is correct on
 *  its own — this was discovered by testing real algorithm
 *  implementations and finding concrete failures both ways, not derived
 *  from first principles. */
function tokenizeIdentifiers(code: string): string {
  return code.replace(/[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g, " $& ");
}

/** Matches any of `keywords` as a real word within the code, after
 *  splitting compound identifiers into their constituent words (see
 *  {@link tokenizeIdentifiers}) — case-insensitive (the caller passes
 *  pre-lowercased `normalizedCode`, but tokenization must run on the
 *  original-case code to detect camelCase boundaries, so this re-derives
 *  its own tokenized+lowercased view rather than reusing `normalizedCode`
 *  directly). */
export function hasKeyword(ctx: AlgorithmDetectionContext, ...keywords: string[]): boolean {
  const tokenized = tokenizeIdentifiers(ctx.code).toLowerCase();
  return keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(tokenized));
}

export function hasPattern(ctx: AlgorithmDetectionContext, pattern: RegExp): boolean {
  return pattern.test(ctx.code);
}

export function hasRecursion(ctx: AlgorithmDetectionContext): boolean {
  return ctx.analysis.recursiveFunctions.length > 0;
}

export function hasLoop(ctx: AlgorithmDetectionContext): boolean {
  return ctx.analysis.loopCount > 0;
}

export function hasNestedLoop(ctx: AlgorithmDetectionContext, minDepth = 2): boolean {
  return ctx.analysis.maxLoopNestingDepth >= minDepth;
}

/** A halving computation on a search-space bound. Covers both the
 *  paired-bound form (`(low + high) / 2`, `(a+b)>>1`) typical of binary
 *  search, and the single-operand form (`length / 2`, `n >> 1`) typical
 *  of merge sort splitting an array — testing an actual merge sort
 *  implementation showed the paired-bound-only version of this regex
 *  missed the far more common single-operand split entirely. */
export function hasHalvingComputation(ctx: AlgorithmDetectionContext): boolean {
  const pairedBound = /[a-z_]\w*\s*[+]\s*[a-z_]\w*\s*\)?\s*(\/\s*2|>>\s*1)/i;
  const singleOperand = /[a-z_]\w*(\.length|\.size\(\))?\s*(\/\s*2|>>\s*1)\b/i;
  return pairedBound.test(ctx.code) || singleOperand.test(ctx.code);
}

/** A common swap idiom: a temp variable, or destructuring/tuple swap
 *  (`[a, b] = [b, a]`, Python's `a, b = b, a`). */
export function hasSwapPattern(ctx: AlgorithmDetectionContext): boolean {
  return (
    /\btemp\b|\btmp\b/.test(ctx.normalizedCode) ||
    /\[\s*\w+\s*,\s*\w+\s*\]\s*=\s*\[\s*\w+\s*,\s*\w+\s*\]/.test(ctx.code) ||
    /^\s*\w+\s*,\s*\w+\s*=\s*\w+\s*,\s*\w+\s*$/m.test(ctx.code)
  );
}
