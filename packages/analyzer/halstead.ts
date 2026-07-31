export interface HalsteadMetrics {
  readonly distinctOperators: number;
  readonly distinctOperands: number;
  readonly totalOperators: number;
  readonly totalOperands: number;
  readonly volume: number;
}

/** An identifier or a numeric/string/word-like literal counts as an
 *  operand; anything else (punctuation, symbols, most keywords) counts as
 *  an operator. This is a text-pattern heuristic, not a full per-language
 *  semantic classification (which would need enumerating every literal
 *  and keyword node type across all six languages) — it's the same
 *  practical approach classic Halstead tooling uses when a full symbol
 *  table isn't available, and it's honestly documented as such rather
 *  than presented as exact. */
const OPERAND_PATTERN = /^([A-Za-z_]\w*|\d[\w.]*|["'`].*["'`])$/;

/**
 * Computes Halstead Volume from a flat list of leaf-token texts (the
 * actual terminal tokens of a parsed file/function — see
 * tree-sitter-halstead.ts and babel-halstead.ts for how each side
 * collects them). Volume = (N1 + N2) * log2(n1 + n2), the standard
 * formula (n = distinct count, N = total count, per operator/operand).
 */
export function computeHalsteadMetrics(tokenTexts: readonly string[]): HalsteadMetrics {
  const operators = new Map<string, number>();
  const operands = new Map<string, number>();

  for (const text of tokenTexts) {
    const bucket = OPERAND_PATTERN.test(text) ? operands : operators;
    bucket.set(text, (bucket.get(text) ?? 0) + 1);
  }

  const distinctOperators = operators.size;
  const distinctOperands = operands.size;
  const totalOperators = [...operators.values()].reduce((sum, count) => sum + count, 0);
  const totalOperands = [...operands.values()].reduce((sum, count) => sum + count, 0);

  const vocabulary = distinctOperators + distinctOperands;
  const length = totalOperators + totalOperands;
  const volume = vocabulary > 0 ? length * Math.log2(vocabulary) : 0;

  return { distinctOperators, distinctOperands, totalOperators, totalOperands, volume };
}
