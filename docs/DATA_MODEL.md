# Data Model

## TypeScript Types

The following interfaces define the shared contract for the Application Customizer, Settings Web Part, and supporting hooks.

```typescript
export type NavLogoSize = 'small' | 'medium' | 'large';
export type NavFontSize = 'sm' | 'md' | 'lg';
export type DropdownLayout = 'vertical' | 'horizontal';

export interface NavItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  order: number;
  folderId?: number;
  allowedGroups: string[];
  openInNewTab: boolean;
}

export interface NavFolder {
  id: number;
  title: string;
  order: number;
  allowedGroups: string[];
  items: NavItem[];
}

export interface NavConfigVersion {
  version: number;
}

export interface NavConfig extends NavConfigVersion {
  logoUrl: string;
  logoSize: NavLogoSize;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  accentColor: string;
  fontSize: NavFontSize;
  fontFamily: string;
  dropdownLayout: DropdownLayout;
  showBreadcrumb: boolean;
  breadcrumbFontSize: NavFontSize;
  hideSharePointNav: boolean;
  showLanguagePicker: boolean;
  availableLanguages: string[];
  currentLanguage: string;
  sourceUrl: string;
}
```

Current config schema version: `1`

## SharePoint List: Navigation

| Internal name | Display name | Type | Required | Notes |
|---|---|---|---|---|
| Title | Label | Single line text | Yes | Nav label shown in UI |
| NavUrl | URL | Single line text | No | Absolute or relative URL |
| NavDescription | Description | Single line text | No | Subtitle in dropdown |
| NavOrder | Order | Number | Yes | Sort order within folder |
| NavFolderId | Folder ID | Number | No | SP item ID of parent folder |
| NavAllowedGroups | Allowed groups | Multiple lines | No | JSON array of group names |
| NavOpenInNewTab | Open in new tab | Yes/No | No | Default: No |

Implementation notes:

- Folder rows should either be stored as SharePoint folders or as list items marked with folder metadata; the runtime must normalize both into `NavFolder`.
- `NavOrder` is authoritative for sorting.
- `NavFolderId` is empty for top-level links and folder rows.
- `NavAllowedGroups` stores a JSON string, not a lookup or People field.

## Web Properties Config Schema

- Key: `OrigamiNavConfig`
- Value: JSON string of the `NavConfig` interface

Example stored JSON:

```json
{
  "version": 1,
  "logoUrl": "https://tenant.sharepoint.com/sites/intranet/assets/logo.png",
  "logoSize": "medium",
  "backgroundColor": "#0F172A",
  "textColor": "#F8FAFC",
  "hoverColor": "#38BDF8",
  "accentColor": "#0EA5E9",
  "fontSize": "md",
  "fontFamily": "system-ui",
  "dropdownLayout": "vertical",
  "showBreadcrumb": false,
  "breadcrumbFontSize": "sm",
  "hideSharePointNav": true,
  "showLanguagePicker": false,
  "availableLanguages": [],
  "currentLanguage": "ja",
  "sourceUrl": ""
}
```
