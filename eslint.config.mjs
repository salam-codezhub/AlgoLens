// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/**
 * Root ESLint flat config for the AlgoLens monorepo.
 *
 * Applies to every `apps/*` and `packages/*` workspace via a single shared
 * config, per CLAUDE.md's "Never mix layers" / single-source-of-truth spirit.
 * Naming conventions below mirror MASTER_10_CLAUDE_RULES_PART_3.md exactly:
 *   Types/Interfaces/Classes -> PascalCase
 *   Functions                -> camelCase
 *   Constants                -> UPPER_SNAKE_CASE
 *   Files                    -> kebab-case.ts(x)  (enforced by convention and
 *                                documented in CLAUDE.md; no dedicated
 *                                filename-lint rule is introduced yet.)
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/webview/**",
      "**/dist-tsc/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/coverage/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Strict typing â€” belt-and-braces alongside tsconfig strict mode.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // Naming conventions per MASTER_10_CLAUDE_RULES_PART_3.md
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
      ],

      // No console.log in production code (per MASTER_10_CLAUDE_RULES_PART_3.md).
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Never swallow errors silently.
      "no-empty": ["error", { allowEmptyCatch: false }],
    },
  },

  // Config/build scripts run under Node without full type info â€” relax the
  // type-checked rules there rather than dragging every dotfile into the
  // TypeScript project graph.
  {
    files: ["**/*.config.{js,mjs,ts}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Genuinely CommonJS files (e.g. webpack.config.cjs) need require()/
  // module.exports â€” exempt them from the TS-authored-code rules entirely
  // rather than fighting the module system they're required to use.
  {
    files: ["**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Prettier compatibility must always be last: it disables only the
  // stylistic ESLint rules that would otherwise conflict with Prettier.
  eslintConfigPrettier
);
