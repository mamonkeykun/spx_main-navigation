# SPFx Top Navigation

SPFx Top Navigation is a SharePoint Framework extension that replaces the default SharePoint header experience with a fully custom top navigation bar and an accompanying admin settings web part. It exists to give site owners a consistent, brandable, permission-aware navigation system that can be shared across sites, managed without code changes, and deployed using standard SPFx packaging and App Catalog workflows.

## Prerequisites

- Node.js `18.x`
- npm `9+`
- SPFx `1.20.0`
- Microsoft 365 tenant with SharePoint Online enabled
- Tenant or site App Catalog access for deployment
- SharePoint modern sites with permission to add SPFx extensions and web parts

## Quick Start

1. Clone the repository and move into the project directory.
2. Run `nvm use`, then `npm install`.
3. Trust the local development certificate with `gulp trust-dev-cert`, then start the local dev server with `gulp serve`.
4. Build and deploy the package with `gulp bundle --ship` and `gulp package-solution --ship`, then upload the generated `.sppkg` to the App Catalog.

## Documentation

| Document | Purpose |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Local development environment setup and troubleshooting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, component tree, and data flow |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | TypeScript, React, CSS, accessibility, and error-handling conventions |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | Branching, commits, pull requests, and release flow |
| [docs/DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md) | Completion checklist for engineering work |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature requirements, acceptance criteria, and edge cases |
| [docs/TARGETING.md](docs/TARGETING.md) | Permission-based targeting design and operational guidance |
| [docs/THEMING.md](docs/THEMING.md) | CSS variables, config storage, and visual customization model |
| [docs/CROSS_SITE_NAV.md](docs/CROSS_SITE_NAV.md) | Cross-site shared navigation behavior and admin setup |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | SharePoint REST and Microsoft Graph API contracts |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Type definitions, list schema, and config JSON structure |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Build, packaging, App Catalog deployment, and rollback |
| [docs/TESTING.md](docs/TESTING.md) | Test strategy, commands, and CI expectations |
| [docs/CODEX_RULES.md](docs/CODEX_RULES.md) | Rules for AI-assisted development in this project |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision records (ADRs) |
| [docs/TASK_LOG.md](docs/TASK_LOG.md) | Living implementation task log |

## License

MIT
