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
