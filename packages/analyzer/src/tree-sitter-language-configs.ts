/**
 * Per-language node-type tables for the four tree-sitter-backed languages
 * (C, C++, Java, Python — JS/TS use Babel instead, see babel-analysis.ts).
 * Every type name here was verified empirically by parsing representative
 * samples with the real grammar and inspecting the actual output, the
 * same discipline used in Phase 20 — not recalled from memory.
 */
export interface TreeSitterAnalysisConfig {
  readonly functionTypes: readonly string[];
  readonly loopTypes: readonly string[];
  /** Node types that always count as one cyclomatic-complexity decision
   *  point on their own (if/catch/case — loops are counted separately
   *  via loopTypes to avoid double-counting when computing nesting). */
  readonly decisionTypes: readonly string[];
  readonly logicalOperatorNodeType: string;
  readonly logicalOperatorValues: readonly string[];
  readonly blockTypes: readonly string[];
  readonly terminatorTypes: readonly string[];
  readonly callTypes: readonly string[];
  readonly callTargetField: string;
  readonly identifierTypes: readonly string[];
}

export const PYTHON_CONFIG: TreeSitterAnalysisConfig = {
  functionTypes: ["function_definition"],
  loopTypes: ["for_statement", "while_statement"],
  decisionTypes: ["if_statement", "except_clause"],
  logicalOperatorNodeType: "boolean_operator",
  logicalOperatorValues: ["and", "or"],
  blockTypes: ["block"],
  terminatorTypes: ["return_statement", "break_statement", "continue_statement", "raise_statement"],
  callTypes: ["call"],
  callTargetField: "function",
  identifierTypes: ["identifier"],
};

export const JAVA_CONFIG: TreeSitterAnalysisConfig = {
  functionTypes: ["method_declaration", "constructor_declaration"],
  loopTypes: ["for_statement", "while_statement", "do_statement"],
  decisionTypes: ["if_statement", "catch_clause", "switch_block_statement_group"],
  logicalOperatorNodeType: "binary_expression",
  logicalOperatorValues: ["&&", "||"],
  blockTypes: ["block"],
  terminatorTypes: ["return_statement", "break_statement", "continue_statement", "throw_statement"],
  callTypes: ["method_invocation"],
  callTargetField: "name",
  identifierTypes: ["identifier"],
};

export const CPP_CONFIG: TreeSitterAnalysisConfig = {
  functionTypes: ["function_definition"],
  loopTypes: ["for_statement", "while_statement", "do_statement"],
  decisionTypes: ["if_statement", "catch_clause", "case_statement"],
  logicalOperatorNodeType: "binary_expression",
  logicalOperatorValues: ["&&", "||"],
  blockTypes: ["compound_statement"],
  terminatorTypes: ["return_statement", "break_statement", "continue_statement", "throw_statement"],
  callTypes: ["call_expression"],
  callTargetField: "function",
  identifierTypes: ["identifier", "field_identifier"],
};

export const C_CONFIG: TreeSitterAnalysisConfig = {
  functionTypes: ["function_definition"],
  loopTypes: ["for_statement", "while_statement", "do_statement"],
  // C has no exceptions, so no catch_clause; switch/case uses the same
  // case_statement type as C++ (verified — both grammars share this).
  decisionTypes: ["if_statement", "case_statement"],
  logicalOperatorNodeType: "binary_expression",
  logicalOperatorValues: ["&&", "||"],
  blockTypes: ["compound_statement"],
  terminatorTypes: ["return_statement", "break_statement", "continue_statement"],
  callTypes: ["call_expression"],
  callTargetField: "function",
  identifierTypes: ["identifier"],
};
