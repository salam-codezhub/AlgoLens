
# MASTER_10_CLAUDE_RULES_PART_3.md

# TypeScript, React & VS Code Extension Rules

## Objective
Maintain enterprise-grade code quality across the UI and extension.

## TypeScript Rules

- Enable strict mode.
- Avoid `any`; prefer `unknown` when necessary.
- Prefer interfaces for public contracts.
- Use discriminated unions for state.
- Keep functions under ~50 lines when practical.
- Extract reusable utilities.

## Naming Conventions

Types / Interfaces: PascalCase
Classes: PascalCase
Functions: camelCase
Constants: UPPER_SNAKE_CASE
Files: kebab-case.ts(x)

## Error Handling

- Never swallow errors.
- Return typed errors from services.
- Log unexpected failures.
- Show user-friendly messages in UI.

## React Rules

- Functional components only.
- Prefer hooks over class components.
- Keep components focused on one responsibility.
- Memoize expensive calculations.
- Avoid unnecessary re-renders.

## Custom Hooks

Create hooks for:
- Workspace state
- Analysis state
- AI chat
- Theme
- Settings

## State Management

- Keep local state local.
- Share global state only when required.
- Avoid prop drilling where context is appropriate.

## VS Code Webview

- Use message passing.
- Validate incoming messages.
- Never trust user input.
- Dispose listeners on cleanup.

## Accessibility

- Keyboard navigation.
- Semantic HTML.
- Focus management.
- Sufficient color contrast.

## Performance

- Lazy-load heavy screens.
- Virtualize long lists.
- Debounce analysis.
- Cache repeated computations.

## Anti-Patterns

Avoid:
- Massive components
- Deep nesting
- Global mutable state
- Duplicate UI logic
- Hardcoded strings

## Quality Checklist

- Strict TypeScript passes
- ESLint passes
- Components reusable
- Hooks reusable
- No console.log in production

End of PART 3
