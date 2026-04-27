# Coding Standards

## Language and Tooling

- TypeScript runs in strict mode with `"strict": true` in `tsconfig.json`.
- Do not use `any`. Prefer `unknown`, discriminated unions, explicit interfaces, and type guards.
- Linting uses `@microsoft/eslint-plugin-spfx` together with `@typescript-eslint`.
- Formatting uses Prettier with repository-level configuration.
- User-facing strings are Japanese. Code identifiers, filenames, exported symbols, and comments remain English unless a Japanese literal is required by UX.

## Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Interfaces | PascalCase, no `I` prefix | `NavConfig` |
| Types | PascalCase | `DropdownLayout` |
| Components | PascalCase | `TopNav.tsx` |
| Hooks | camelCase, `use` prefix | `useNavData.ts` |
| CSS Modules | camelCase | `styles.navBar` |
| Constants | SCREAMING_SNAKE | `DEFAULT_FONT_SIZE` |
| Event handlers | `handle` prefix | `handleFolderClick` |
| Boolean props | `is/has/show` prefix | `isOpen`, `showBreadcrumb` |

## File Structure Rules

- One component per file.
- Co-locate styles as `ComponentName.tsx` and `ComponentName.module.css`.
- Put hooks in `hooks/`.
- Put shared types in `types/navTypes.ts`; it is the single source of truth.
- Do not create barrel files such as `index.ts`; import directly from concrete file paths.

## Component Rules

- Use functional components only.
- Define the props interface directly above the component.
- Use default exports for components.
- Use named exports for hooks and utilities.
- Destructure props in the function signature.
- Do not use inline styles except for CSS variable injection on the top nav root.
- Keep each component file under 200 lines; split logic into hooks or child components if needed.

## Import Order

1. React
2. SPFx and PnPjs packages
3. Fluent UI packages, only in the Settings Web Part
4. Local components
5. Local hooks
6. Local types
7. CSS modules

## Error Handling

- Wrap all async functions in `try/catch`.
- Every data-fetching hook must expose loading and error states.
- Never swallow errors silently.
- Log errors to the console in development builds so diagnostics remain available.
- Show a user-visible fallback message when an error affects rendered output or admin actions.

## Accessibility

- All interactive elements must be keyboard navigable.
- Icon-only buttons require `aria-label`.
- Dropdown triggers require `aria-expanded`.
- Text contrast must meet at least `4.5:1`.
- Focus styles must remain visible and not rely on color alone.

## CSS and Styling

- Use CSS Modules for component styles.
- Expose runtime theming through CSS custom properties owned by the nav root.
- Avoid global selectors except for deliberate SharePoint chrome overrides injected by the customizer.
- Prefer layout primitives that degrade well on narrow viewports.

## Testing and Documentation Expectations

- Add tests for hooks and utilities that contain logic.
- Keep JSDoc on exported functions and exported interfaces.
- Update related documentation when setup, architecture, or runtime behavior changes.
