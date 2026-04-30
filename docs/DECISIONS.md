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
Status: Superseded

### Context

The Settings Web Part benefits from admin-oriented controls, while the Application Customizer must stay lean for runtime performance.

### Decision

Use Fluent UI only inside the Settings Web Part and avoid it in the Application Customizer bundle.

### Consequences

- Admin UX can use mature controls such as panels, toggles, and pickers.
- Runtime navigation payload stays smaller.
- Shared design tokens must be mapped carefully between custom nav styles and Fluent UI controls.

Superseded by: ADR-008, ADR-014

## ADR-006: JSON array in Multiple-lines-of-text for allowedGroups

Date: 2026-04-27  
Status: Superseded

### Context

The project needs to store multiple SharePoint group identifiers per folder or item without introducing lookup complexity or people field semantics.

### Decision

Store `allowedGroups` as a JSON array in a multiple-lines-of-text column.

### Consequences

- The runtime can parse targeting data into a simple `string[]`.
- Admin tooling must validate JSON before save.
- The field is flexible but relies on disciplined formatting rather than enforced relational structure.

Superseded by: ADR-009

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

## ADR-008: 管理UIをApplication Customizerに内包

Date: 2026-04-30  
Status: Accepted

### Context

ナビゲーション設定 UI の配置場所を決定する必要があった。

### Decision

設定パネルと編集パネルを Application Customizer 内のフローティングオーバーレイとして実装する。Web Part は使用しない。

### Consequences

- 管理 UI はナビバー上の歯車ボタンと編集ボタンから起動する
- Settings Web Part は不要になる
- 管理 UI の表示は `isSiteAdmin` で制御する

## ADR-009: SPネイティブ権限によるターゲティング

Date: 2026-04-30  
Status: Accepted

### Context

ナビリンクのターゲティング実装方法を決定する必要があった。

### Decision

SharePoint のアイテムレベル権限を使用する。`NavAllowedGroups` 列とクライアントサイドフィルタは使用しない。

### Consequences

- `useNavFilter`、`useCurrentUser`、`PermissionEditor` は不要
- リスト項目とフォルダの表示制御は SharePoint REST API の返却結果に委ねる
- `Navigation` リストのスキーマは単純になる

## ADR-010: FileDirRefによる親子関係の管理

Date: 2026-04-30  
Status: Accepted

### Context

ナビフォルダとアイテムの親子関係の実装方法を決定する必要があった。

### Decision

SP リストのネイティブフォルダ構造を使用する。親子関係は `FileDirRef` によるパス照合で判定する。

### Consequences

- `NavFolderId` 列は不要になる
- `useNavData.ts` は `getItemsForFolder()` と `getTopLevelItems()` を提供する
- `NavItemEditor` はネイティブフォルダパスへ項目を作成・移動する

## ADR-011: Custom ColorPicker without Fluent UI in the Application Customizer

Date: 2026-04-30  
Status: Accepted

### Context

設定パネルには richer な color picker が必要だが、Application Customizer バンドルに Fluent UI を持ち込みたくない。

### Decision

色変換ユーティリティと picker panel を分離した custom ColorPicker を extension code 内で実装する。

### Consequences

- `@fluentui/react` なしでカラーピッカーを維持できる
- `ColorPicker.tsx` は 200 行制限のため panel と utility に分割する

## ADR-012: isSiteAdmin gates admin-only controls

Date: 2026-04-30  
Status: Accepted

### Context

歯車ボタンと「ナビゲーションを追加・編集」ボタンは管理者だけに表示する必要がある。

### Decision

`legacyPageContext.isSiteAdmin` を使って管理 UI の表示可否を判定する。

### Consequences

- 一般ユーザーにはクリーンなナビバーのみ表示される
- 管理 UI の表示条件は customizer 内で一貫する

## ADR-013: Missing Navigation list returns empty data

Date: 2026-04-30  
Status: Accepted

### Context

`Navigation` リストが未作成のサイトでも customizer は起動する。

### Decision

404 時は一般エラーにせず空データを返し、管理者向けの案内ログを出す。

### Consequences

- 未構成サイトでもランタイムが致命エラーにならない
- 管理者は provisioning 実行の必要性を把握できる

## ADR-014: Alias `gulp serve` to SPFx `serve-deprecated`

Date: 2026-04-29  
Status: Accepted

### Context

SPFx 1.20 registers the local dev server task as `serve-deprecated`, but project scripts and operator expectations still use `gulp serve`.

### Decision

Register a `serve` alias in `gulpfile.js` that points to the SPFx-provided `serve-deprecated` executable.

### Consequences

- Local setup commands can continue using `gulp serve`.
- The project keeps the underlying SPFx task implementation unchanged.
- Future SPFx upgrades should revisit this alias if the framework restores a native `serve` task name.

## ADR-015: Breadcrumb reads visible folders from a local React context

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

## ADR-016: Language picker uses a temporary `lang` query parameter redirect

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

## ADR-017: Empty folders render as non-dropdown labels

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
