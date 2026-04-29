# Decisions

## ADR-001: Application Customizer for nav rendering

Date: 2026-04-27  
Status: Accepted

### Context

The navigation must appear consistently across modern pages without requiring page authors to add a web part everywhere.

### Decision

Use an SPFx Application Customizer to render the top navigation in the Header placeholder.

### Consequences

- Navigation is centrally applied at the page chrome level.
- The solution works across home, content, and news pages.
- Rendering depends on SharePoint placeholder availability and extension registration rather than page author placement.

## ADR-002: Web Properties bag for config storage

Date: 2026-04-27  
Status: Accepted

### Context

Visual configuration is site-scoped singleton metadata, not repeated content.

### Decision

Store nav configuration in the web property bag instead of a separate SharePoint list.

### Consequences

- Config reads are simple and lightweight.
- The `Navigation` list remains focused on content rows only.
- Config editing requires correct property bag permissions and explicit migration logic.

## ADR-003: PnPjs v3 as the SharePoint API abstraction layer

Date: 2026-04-27  
Status: Accepted

### Context

The project needs a consistent way to call SharePoint REST APIs, handle auth context, and reduce boilerplate.

### Decision

Use PnPjs v3 as the primary SharePoint API abstraction layer.

### Consequences

- Data access code is shorter and more consistent.
- Built-in helpers reduce manual request plumbing.
- The project depends on PnPjs conventions and version compatibility with SPFx 1.20.0.

## ADR-004: CSS injection for hiding SharePoint native navigation

Date: 2026-04-27  
Status: Accepted

### Context

The custom nav must optionally suppress native SharePoint chrome but remain reversible and low-risk.

### Decision

Hide SharePoint navigation through injected CSS rather than DOM removal or mutation.

### Consequences

- Native elements remain intact and can be restored by removing the style block.
- The implementation is less brittle than moving DOM nodes.
- Selector maintenance is still required when SharePoint markup changes.

## ADR-005: Fluent UI only in Settings Web Part

Date: 2026-04-27  
Status: Accepted

### Context

The Settings Web Part benefits from admin-oriented controls, while the Application Customizer must stay lean for runtime performance.

### Decision

Use Fluent UI only inside the Settings Web Part and avoid it in the Application Customizer bundle.

### Consequences

- Admin UX can use mature controls such as panels, toggles, and pickers.
- Runtime navigation payload stays smaller.
- Shared design tokens must be mapped carefully between custom nav styles and Fluent UI controls.

## ADR-006: JSON array in Multiple-lines-of-text for allowedGroups

Date: 2026-04-27  
Status: Accepted

### Context

The project needs to store multiple SharePoint group identifiers per folder or item without introducing lookup complexity or people field semantics.

### Decision

Store `allowedGroups` as a JSON array in a multiple-lines-of-text column.

### Consequences

- The runtime can parse targeting data into a simple `string[]`.
- Admin tooling must validate JSON before save.
- The field is flexible but relies on disciplined formatting rather than enforced relational structure.

## ADR-007: No barrel files to avoid circular dependency risk

Date: 2026-04-27  
Status: Accepted

### Context

The codebase is expected to grow across hooks, components, utilities, and SPFx entry points.

### Decision

Do not use barrel files such as `index.ts`; import directly from concrete modules.

### Consequences

- Import paths are slightly longer but explicit.
- Circular dependency risk is reduced.
- Refactors require more direct import updates when files move.

## ADR-008: HTML5 drag and drop over an external DnD library

Date: 2026-04-27  
Status: Accepted

### Context

The navigation manager needs drag-to-reorder behavior inside SPFx, but the project rules prohibit adding dependencies without approval and the admin UI does not require a complex cross-list drag system.

### Decision

Use the native HTML5 Drag and Drop API for item reordering instead of adding a dedicated drag-and-drop library.

### Consequences

- The solution avoids a new bundle dependency in the admin surface.
- Reorder behavior stays limited to the current item list, which matches the current requirement.
- Advanced accessibility and cross-device drag behavior remain simpler than a full DnD framework.

## ADR-009: Auto-save with debounce over an explicit Save button

Date: 2026-04-27  
Status: Accepted

### Context

The settings panel edits a singleton configuration object where most changes should feel immediate, but some fields such as URLs and colors produce noisy writes if persisted on every keystroke.

### Decision

Persist settings automatically and debounce text-like inputs instead of requiring a separate Save button.

### Consequences

- The admin flow is faster because common changes save inline.
- Debounce reduces unnecessary property bag writes for rapidly changing inputs.
- Save-state feedback remains necessary because persistence is implicit rather than user-triggered.

## ADR-010: Panel for permission editing instead of a dialog

Date: 2026-04-27  
Status: Accepted

### Context

Permission targeting needs a group list that can grow vertically and may require repeated open/save cycles while the admin keeps the main manager context visible.

### Decision

Render permission editing in a slide-in `Panel` instead of a modal dialog.

### Consequences

- The group checklist has more vertical space than a dialog would comfortably provide.
- The admin can preserve spatial context in the navigation manager while editing permissions.
- The UI introduces one more surface state to manage in the settings app.

## ADR-011: HTML5 focus trap for the mobile drawer

Date: 2026-04-27  
Status: Accepted

### Context

The mobile drawer needs keyboard-safe focus containment, but the project should avoid pulling in a separate focus-trap library for a single overlay surface.

### Decision

Use a small HTML and keyboard-event based focus loop inside `MobileDrawer` rather than adding an external package.

### Consequences

- The drawer remains keyboard navigable and self-contained.
- The implementation stays dependency-free and easy to audit.
- Focus management remains intentionally scoped to the drawer rather than becoming a shared modal framework.

## ADR-012: Promise.race for cross-site timeout handling

Date: 2026-04-27  
Status: Accepted

### Context

Cross-site navigation needs a deterministic timeout and fallback path, but the data hook already relies on PnPjs fluent calls rather than a raw `fetch` pipeline.

### Decision

Use `Promise.race` with a timeout promise to detect slow cross-site reads and trigger a local-site fallback.

### Consequences

- Timeout handling stays explicit in the hook without deeper PnPjs cancellation wiring.
- The user gets a targeted timeout message and the nav can still render from the local site.
- The remote request is not actively aborted; the timeout only controls the hook’s awaited result.

## ADR-013: Case-sensitive group matching for LoginName checks

Date: 2026-04-27  
Status: Accepted

### Context

SharePoint targeting values are stored as raw `LoginName` strings, and normalizing casing in the runtime could hide data issues or diverge from what SharePoint actually returns.

### Decision
Use case-sensitive string comparison for group membership checks.

### Consequences

- Runtime behavior matches the exact values returned by SharePoint.
- Administrators must enter targeting values with the expected casing.
- Mismatches surface as data-quality issues instead of being silently normalized.

## ADR-014: Auto-provision the Navigation list on first 404

Date: 2026-04-29  
Status: Accepted

### Context

The navigation hook can run on sites where the `Navigation` list has not been provisioned yet. Treating that state as a generic fetch failure prevents first-run recovery and leaves the UI in an avoidable error state.

### Decision

When navigation data loading receives a 404 for the `Navigation` list, attempt to create the list and required fields automatically, then return empty navigation data instead of surfacing a generic read error.

### Consequences

- New or partially configured sites can recover without manual list creation.
- A failed provisioning attempt still surfaces a targeted admin-facing error message.
- The hook now treats missing-list 404 responses as a recoverable bootstrap condition rather than a terminal fetch error.

Keep `allowedGroups` matching case-sensitive.

### Consequences

- Runtime behavior mirrors stored SharePoint `LoginName` values directly.
- Tests can document exact matching semantics for support and admin troubleshooting.
- Admins must store the correct casing in `NavAllowedGroups` data.

## ADR-014: Breadcrumb reads visible folders from a local React context

Date: 2026-04-27  
Status: Accepted

### Context

The breadcrumb component must render the parent folder label, but its public prop contract only accepts `items` and `fontSize`.

### Decision

Provide the visible folder structure from `TopNav` through a local React context consumed by `Breadcrumb`.

### Consequences

- The breadcrumb keeps the requested narrow prop surface.
- Folder labels stay aligned with the filtered nav actually being rendered.
- `TopNav` owns one extra provider boundary for runtime nav state.

## ADR-015: Language picker uses a temporary `lang` query parameter redirect

Date: 2026-04-27  
Status: Accepted

### Context

The runtime component contract requires `LanguagePicker` selection to trigger navigation, but the exact SharePoint multilingual switch flow is not yet wired into the Application Customizer.

### Decision

Use a temporary redirect that appends or updates a `lang` query parameter in the current page URL.

### Consequences

- Language selection is observable and testable in the runtime UI.
- The implementation stays isolated to the customizer until the SharePoint-native switch flow is added.
- NAV work that integrates the real multilingual endpoint must replace this interim behavior.

## ADR-016: Empty folders render as non-dropdown labels

Date: 2026-04-27  
Status: Accepted

### Context

The shared `NavFolder` type does not expose a URL, but the runtime still needs to render empty folders without inventing unsupported destination data.

### Decision

Render empty folders as top-level labels that do not open a dropdown.

### Consequences

- The UI remains faithful to the current data model.
- Empty folders do not trigger broken or fabricated links.
- If clickable empty folders are required later, the shared type contract must be extended first.
