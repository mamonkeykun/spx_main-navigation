# Definition of Done

Every task must satisfy all of the following before it is marked done.

## Code Quality

- [ ] TypeScript compiles with zero errors (`tsc --noEmit`)
- [ ] ESLint passes with zero errors (`npm run lint`)
- [ ] No `any` types introduced
- [ ] No unused imports or variables
- [ ] Component is under 200 lines

## Functionality

- [ ] Feature works in SharePoint Online (modern page)
- [ ] Application Customizer renders on all page types (home, content, news)
- [ ] Nav items filter correctly per user group
- [ ] Settings changes persist after page reload
- [ ] Cross-site navigation works when `sourceUrl` is set

## Accessibility and UX

- [ ] Keyboard navigation works (Tab, Enter, Escape on dropdowns)
- [ ] Screen reader announces nav structure (aria roles)
- [ ] Mobile responsive (hamburger menu at ≤768px)
- [ ] No console errors in browser DevTools

## Testing

- [ ] Unit tests written for hooks (`useNavFilter`, `useNavData`, `useNavConfig`)
- [ ] All new tests pass (`npm test`)
- [ ] Test coverage does not decrease

## Documentation

- [ ] JSDoc comment on all exported functions and interfaces
- [ ] README updated if setup steps changed
- [ ] `DECISIONS.md` updated if architecture decision was made

## Deployment

- [ ] `gulp bundle --ship` completes without errors
- [ ] `gulp package-solution --ship` completes without errors
- [ ] `.sppkg` successfully uploaded to App Catalog in test environment
