# Git Workflow

## Branch Naming

```text
main              ← production-ready only
develop           ← integration branch
feature/<ticket>-<short-desc>    e.g. feature/NAV-12-dropdown-layout
bugfix/<ticket>-<short-desc>     e.g. bugfix/NAV-34-breadcrumb-path
hotfix/<ticket>-<short-desc>
docs/<short-desc>
```

## Commit Message Format

Conventional Commits format:

```text
<type>(<scope>): <subject in Japanese OK>
```

Types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `test`
- `chore`
- `build`

Scopes:

- `customizer`
- `webpart`
- `nav-data`
- `targeting`
- `theming`
- `breadcrumb`
- `deploy`

Examples:

```text
feat(targeting): セキュリティグループによるリンク表示制御を実装
fix(breadcrumb): 現在ページのパス検出が空になるバグを修正
docs(setup): ローカル環境構築手順を更新
```

## Pull Request Rules

- All PRs target `develop`.
- Never open a PR directly against `main` unless executing the approved release flow.
- PR titles follow the same Conventional Commits format as commit messages.
- Every PR description must explain what changed and why.
- Every PR must include concrete testing steps so a reviewer can verify behavior.
- Include screenshots when UI behavior or appearance changed.
- At least one reviewer approval is required before merge.
- Use squash merge to keep the history linear and readable.

## Release Flow

```text
develop → release/vX.Y.Z → main → tag vX.Y.Z
```

Release expectations:

1. Cut `release/vX.Y.Z` from `develop`.
2. Run final validation in the staging tenant.
3. Merge release to `main`.
4. Create and push the Git tag `vX.Y.Z`.
5. Merge release changes back into `develop` if any release-only fixes were made.

## Protected Branches

- `main` and `develop` are protected.
- No direct pushes are allowed.
- CI must pass before merge.
- Force pushes are disabled.
- Branch deletion after merge is allowed for feature, bugfix, hotfix, and docs branches.
