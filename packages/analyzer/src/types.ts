import type { AstSummary, SupportedLanguage } from "@algolens/parser";

export interface FunctionComplexity {
  readonly name: string;
  readonly cyclomaticComplexity: number;
}

export interface UnusedSymbol {
  readonly name: string;
  /** True confidence this is genuinely unused requires full scope
   *  resolution, which this engine doesn't do (see unused-variables.ts's
   *  doc comment) — this flags it as a heuristic result, not a guarantee. */
  readonly confidence: number;
}

export interface DeadCodeLocation {
  readonly afterStatementType: string;
  readonly unreachableStatementCount: number;
}

/**
 * Everything MASTER_02_PHASES.md's Phase 21 lists under "Detect": Loops,
 * Nested Loops, Recursion, Unused Variables, Dead Code, Imports,
 * Cyclomatic Complexity, Maintainability Index. Builds directly on Phase
 * 20's {@link AstSummary} (loops, recursion, imports already come from
 * there) rather than re-deriving what's already been extracted.
 */
export interface StaticAnalysisResult {
  readonly filePath: string;
  readonly language: SupportedLanguage;
  readonly analyzedAt: number;

  readonly loopCount: number;
  readonly maxLoopNestingDepth: number;
  readonly recursiveFunctions: readonly string[];

  readonly imports: readonly string[];
  readonly unusedImports: readonly UnusedSymbol[];
  readonly unusedVariables: readonly UnusedSymbol[];
  readonly deadCode: readonly DeadCodeLocation[];

  readonly functionComplexity: readonly FunctionComplexity[];
  readonly fileCyclomaticComplexity: number;
  readonly maintainabilityIndex: number;

  readonly ast: AstSummary;
}
