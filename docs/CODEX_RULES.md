# Codex Rules

## Purpose

This file governs how AI tools such as GitHub Copilot, Claude, and Codex must behave when generating code for this project. Always read this file before generating code.

## Mandatory Rules

### 1. Read Types First

Before implementing any component or hook, read `src/extensions/topNavigation/types/navTypes.ts` and `docs/DATA_MODEL.md`. Never invent new type shapes.

### 2. One File Per Task

Generate one file at a time. Do not generate multiple files in a single response unless explicitly asked. Confirm each file before moving on.

### 3. No `any`

Never use `any`. Use `unknown` with type guards, or extend existing interfaces.

### 4. Match Existing Patterns

Read at least one existing hook before writing a new hook. Read at least one existing component before writing a new component. Mirror the established structure for import order, prop interface placement, and export style.

### 5. CSS Modules Only

Never write inline styles except for CSS variable injection on the nav root. Never use Tailwind, styled-components, or emotion. All styles go in `.module.css` files.

### 6. No New Dependencies Without Approval

Do not add any npm package not already present in `package.json`. If a new package is required, output:

```text
DEPENDENCY NEEDED: <package> — reason: <why>
```

Then stop and wait for approval.

### 7. SharePoint-Safe DOM Access

Never use `document.getElementById` or raw DOM queries inside React components. CSS injection is the only acceptable direct DOM manipulation, and only inside `useEffect`. Use React refs for component-internal DOM access.

### 8. Error Boundaries

Every async call must have a `try/catch`. Loading state must be handled. Error state must surface to the UI, not only the console.

### 9. Log Decisions

If you make a non-obvious implementation choice, add a code comment:

```typescript
// DECISION: <reason>
```

Also add an entry to `docs/DECISIONS.md`.

### 10. Test Alongside Implementation

When generating a hook, also generate its test file. When generating a utility function, also generate its test file. Components do not require tests unless they contain logic.

## What Codex Must Not Do

- Do not modify `package.json`, `tsconfig.json`, or `gulpfile.js` unless the task explicitly requires it.
- Do not generate App Catalog XML or SharePoint provisioning XML; use the PnP PowerShell approach in `DEPLOYMENT.md`.
- Do not use class components.
- Do not import from `@fluentui/react` in Application Customizer code.
- Do not use `localStorage` or `sessionStorage`.
- Do not hardcode site URLs, tenant names, or group names.

## Output Format

When generating a file, output:

1. File path relative to project root
2. Complete file content in a code block
3. Brief explanation of key decisions in 2 to 5 bullet points
4. Checklist of Definition of Done items satisfied
