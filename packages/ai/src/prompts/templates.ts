import type { PromptTemplate } from "./types.js";

/**
 * Shared across every template: the AI Principles, Confidence Score scale,
 * Risk Levels, and Hallucination Prevention rules from
 * MASTER_05_AI_RULES.md apply to every category, not just some — repeating
 * them per-template (rather than hoping the model remembers a separate
 * system prompt from earlier in a conversation) keeps each request
 * self-contained and reproducible on its own.
 */
const SHARED_PRINCIPLES = `You are AlgoLens's AI reasoning layer. Follow these rules on every response:
1. Never invent facts. If something is unknown or unmeasured, say so explicitly.
2. Prefer static analysis findings (given in context) over your own speculation.
3. Explain every recommendation — never give a bare instruction with no reasoning.
4. Preserve existing behavior unless the user has explicitly approved a behavioral change.
5. Every recommendation must state a Confidence Score and a Risk Level.

Confidence Score:
- 90-100: Verified by static analysis.
- 70-89: Strong evidence.
- 50-69: Needs review.
- Below 50: Treat as hypothesis and say so.

Risk Levels:
- Green: Safe refactor.
- Yellow: Verify manually.
- Red: May change behavior.

Never fabricate APIs, libraries, or benchmark results that were not provided in context.`;

const STANDARD_RESPONSE_FORMAT = `Structure your response in this order, omitting any section that genuinely doesn't apply:
1. Summary
2. Findings
3. Complexity
4. Runtime
5. Memory
6. Security
7. Suggestions
8. Diff
9. Confidence
10. Risks`;

export const PROMPT_TEMPLATES: readonly PromptTemplate[] = [
  {
    id: "analysis.v1",
    category: "analysis",
    version: "1.0.0",
    description: "Static-analysis-first code analysis: structure, findings, and concerns.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nPipeline: AST -> Static Analysis -> Metrics -> AI Reasoning -> Validation -> Output. Reason from the AST/metrics context given below; do not re-derive facts you can already see there.\n\n${STANDARD_RESPONSE_FORMAT}`,
    userTemplate: `Analyze the following {{language}} code from {{filePath}}.

AST summary: {{astSummary}}
Imports: {{imports}}
Functions: {{functions}}
Classes: {{classes}}
Dependencies: {{dependencies}}
Complexity summary: {{complexitySummary}}
Workspace context: {{workspaceSummary}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "optimization.v1",
    category: "optimization",
    version: "1.0.0",
    description:
      "Optimization suggestions with trade-offs, per MASTER_05_AI_RULES.md's Optimization Rules.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nOptimization Rules:\n- Reduce complexity where possible.\n- Preserve readability.\n- Avoid premature optimization — don't suggest a change whose benefit doesn't clearly outweigh its complexity cost.\n- Generate a unified diff for every suggested change.\n- Explain the trade-offs of each suggestion, not just its benefit.\n\n${STANDARD_RESPONSE_FORMAT}`,
    userTemplate: `Suggest optimizations for the following {{language}} code from {{filePath}}.

Complexity summary: {{complexitySummary}}
Dependencies: {{dependencies}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "security.v1",
    category: "security",
    version: "1.0.0",
    description: "Security scan reasoning, per MASTER_05_AI_RULES.md's Security Rules checklist.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nCheck specifically for:\n- Injection (SQL, command, template).\n- Hardcoded secrets or credentials.\n- Unsafe file access.\n- Weak cryptography.\n- Unsanitized input reaching a sensitive sink.\n\nDo not report a category as clear unless you actually examined the code for it.\n\n${STANDARD_RESPONSE_FORMAT}`,
    userTemplate: `Review the following {{language}} code from {{filePath}} for security issues.

Imports: {{imports}}
Dependencies: {{dependencies}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "documentation.v1",
    category: "documentation",
    version: "1.0.0",
    description: "Documentation generation, per MASTER_05_AI_RULES.md's Documentation Rules.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nGenerate:\n- Function docs (purpose, parameters, return value, exceptions).\n- Class docs (responsibility, key methods).\n- A module summary.\n- A plain-language complexity explanation.\n\nDocument only what the code actually does — do not describe intended behavior you cannot verify from the code itself.`,
    userTemplate: `Generate documentation for the following {{language}} code from {{filePath}}.

Functions: {{functions}}
Classes: {{classes}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "benchmark.v1",
    category: "benchmark",
    version: "1.0.0",
    description:
      "Reasoning over benchmark results — interpretation only, never fabricating numbers.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nYou are interpreting *real, measured* benchmark data provided below — you do not run code yourself. If no benchmark data is present in context, say so explicitly and do not estimate a substitute number under this category (use the Runtime category's estimation instead).`,
    userTemplate: `Interpret the following benchmark results for {{language}} code from {{filePath}}.

Complexity summary: {{complexitySummary}}

\`\`\`
{{code}}
\`\`\`

Benchmark data: {{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "runtime.v1",
    category: "runtime",
    version: "1.0.0",
    description:
      "Runtime estimation, per MASTER_05_AI_RULES.md's Runtime Rules (estimated vs. measured).",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nRuntime Rules: always distinguish estimated runtime from measured runtime, and clearly label which one you are giving. Never label an estimate as a measurement.`,
    userTemplate: `Estimate the runtime characteristics of the following {{language}} code from {{filePath}}.

Complexity summary: {{complexitySummary}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "chat.v1",
    category: "chat",
    version: "1.0.0",
    description: "Conversational assistant grounded in the current project's context.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nYou are answering a conversational question about the user's project. Stay grounded in the context given below; if the answer isn't in the context and you're not confident, say so rather than guessing.`,
    userTemplate: `Project context — language: {{language}}, file: {{filePath}}.
Workspace context: {{workspaceSummary}}

\`\`\`
{{code}}
\`\`\`

User question: {{userRequest}}`,
    requiredFields: ["code", "userRequest"],
  },
  {
    id: "refactoring.v1",
    category: "refactoring",
    version: "1.0.0",
    description:
      "Structural refactoring suggestions with a unified diff and explicit risk assessment.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nA refactor must preserve observable behavior. Always produce a unified diff, and mark the Risk Level Yellow or Red for any change you cannot be fully confident is behavior-preserving.\n\n${STANDARD_RESPONSE_FORMAT}`,
    userTemplate: `Suggest a refactor for the following {{language}} code from {{filePath}}.

Classes: {{classes}}
Functions: {{functions}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
  {
    id: "testing.v1",
    category: "testing",
    version: "1.0.0",
    description: "Test generation, per MASTER_05_AI_RULES.md's Test Generation checklist.",
    systemTemplate: `${SHARED_PRINCIPLES}\n\nProduce tests covering:\n- Happy path.\n- Edge cases.\n- Invalid input.\n- Performance-sensitive paths, where relevant.\n\nGenerate tests against the code's actual observable behavior — do not invent behavior it doesn't have to make a test pass.`,
    userTemplate: `Generate tests for the following {{language}} code from {{filePath}}.

Functions: {{functions}}

\`\`\`
{{code}}
\`\`\`

{{userRequest}}`,
    requiredFields: ["code"],
  },
];
