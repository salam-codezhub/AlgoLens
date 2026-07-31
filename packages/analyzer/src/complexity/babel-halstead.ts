import type { File } from "@babel/types";

interface TokenLike {
  readonly start: number;
  readonly end: number;
}

function isTokenLike(value: unknown): value is TokenLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { start?: unknown }).start === "number" &&
    typeof (value as { end?: unknown }).end === "number"
  );
}

/** Collects each token's source text from Babel's own token stream
 *  (`ast.tokens`, populated when `tokens: true` is passed to `parse()` —
 *  see Phase 20's babel-extractor.ts, where this exact option was a real
 *  bug fix). Slicing by `start`/`end` works uniformly across every token
 *  kind (identifiers, punctuators, keywords, literals) without needing to
 *  branch on token type.
 *
 * `@babel/types` itself types `File.tokens` as `any[] | null` (a real gap
 * in its own declarations, not something under this project's control) —
 * {@link isTokenLike} validates the shape actually needed at the boundary
 * instead of letting `any` leak into the rest of this module. */
export function collectTokenTexts(ast: File, code: string): string[] {
  return (ast.tokens ?? [])
    .filter(isTokenLike)
    .map((token) => code.slice(token.start, token.end))
    .filter((text) => text.trim().length > 0);
}
