# Testing

## Testing Stack

- Unit tests: Jest + `@testing-library/react`
- SPFx mock support: `@microsoft/sp-core-library` test utilities
- Coverage threshold: `80%` for hooks, `60%` overall

## What to Test

### Unit Tests

- `useNavFilter`: combinations of matching groups, non-matching groups, empty groups, and hidden folders
- `useNavConfig`: default config, partial stored config, invalid JSON, and version migration
- `filterNavByGroups` pure function: exhaustive input/output behavior
- Breadcrumb path computation utility: root path, nested path, trailing slash, and query string normalization

### Integration Tests

Manual validation in the SharePoint hosted workbench and on modern pages:

- Nav renders on Communication Site, Team Site, and Hub Site
- Permission targeting hides items correctly
- Cross-site URL loads remote nav
- Settings save and persist after reload
- Uninstall leaves no visual artifacts

## Running Tests

```bash
npm test
npm test -- --watch
npm test -- --coverage
```

## Test File Naming

- Unit test files: `ComponentName.test.ts`
- Hook test files: `useHookName.test.ts`
- Co-locate tests with the source file or keep hook tests inside the `hooks/` directory

## CI

GitHub Actions workflow file: `.github/workflows/ci.yml`

Expected pipeline:

1. Trigger on push to any branch.
2. Trigger on pull requests targeting `develop`.
3. Install dependencies.
4. Run lint.
5. Run `tsc --noEmit`.
6. Run tests.
7. Run `gulp build --ship`.

The workflow must fail the PR if any step fails.
