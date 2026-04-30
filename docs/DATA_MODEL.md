# Data Model

## TypeScript 型定義

### NavFolder

SharePoint Navigation リストのフォルダ（`FSObjType = 1`）に対応します。  
表示制御は SharePoint のアイテムレベル権限で行います。

```ts
export interface NavFolder {
  id: string;
  spItemId: number;
  label: string;
  url?: string;
  order: number;
  folderPath: string;
}
```

### NavItem

SharePoint Navigation リストのアイテム（`FSObjType = 0`）に対応します。  
表示制御は SharePoint のアイテムレベル権限で行います。

```ts
export interface NavItem {
  id: string;
  spItemId: number;
  label: string;
  url: string;
  description?: string;
  order: number;
  parentFolderPath: string;
  openInNewTab: boolean;
}
```

### NavConfig

Web Properties バッグの `OrigamiNavConfig` に JSON 文字列として保存します。

```ts
export interface NavConfig {
  version: number;
  logoUrl?: string;
  logoSize: number;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontSize: number;
  hideSharePointNav: boolean;
  showBreadcrumb: boolean;
  breadcrumbFontSize: number;
  showLanguagePicker: boolean;
  dropdownLayout: 'vertical' | 'horizontal';
  sourceUrl?: string;
}
```

Current config schema version: `1`

## SharePoint List: Navigation

### 重要: アーキテクチャ前提

- トップレベルナビラベルは SharePoint リストフォルダ（`FSObjType = 1`）
- 子アイテムはフォルダ内のリストアイテム（`FSObjType = 0`）
- 権限制御は SharePoint の「アクセスの管理」を使用
- `NavAllowedGroups` 列は存在しない
- `NavFolderId` 列は存在しない

### 列定義

| 内部名 | 表示名 | 型 | 必須 | 説明 |
|---|---|---|---|---|
| Title | ラベル | 1行テキスト | はい | ナビに表示する名称 |
| NavUrl | URL | 1行テキスト | いいえ | リンク URL。フォルダでは任意 |
| NavDescription | 説明 | 1行テキスト | いいえ | ドロップダウンのサブテキスト |
| NavOrder | 並び順 | 数値 | いいえ | 表示順 |
| NavOpenInNewTab | 新しいタブで開く | はい/いいえ | いいえ | デフォルト: いいえ |

### 存在しない列

- ~~NavAllowedGroups~~: SharePoint ネイティブ権限を使うため不要
- ~~NavFolderId~~: `FileDirRef` ベースのネイティブフォルダ構造を使うため不要

### `FileDirRef` の役割

- フォルダではフォルダ自体のサーバー相対パスを表します
- アイテムでは親フォルダのサーバー相対パスを表します
- `useNavData.ts` は `FileDirRef` を使ってフォルダとアイテムを関連付けます

## Web Properties Config Schema

- Key: `OrigamiNavConfig`
- Value: `NavConfig` の JSON 文字列
