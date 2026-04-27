# Theming

## CSS Variable Injection

The Application Customizer owns theming at runtime by injecting CSS custom properties on the nav root element. Components read those variables through CSS Modules instead of inline style declarations. This keeps styling centralized and allows config changes to propagate across the full nav tree without component-specific overrides.

Default variables:

```css
--nav-bg:            #0F172A;
--nav-text:          #F8FAFC;
--nav-hover:         #38BDF8;
--nav-accent:        #0EA5E9;
--nav-font-family:   system-ui, sans-serif;
--nav-font-size:     14px;      /* sm=12 md=14 lg=16 */
--nav-logo-height:   40px;      /* small=32 medium=40 large=56 */
--nav-height:        56px;
--nav-dropdown-cols: 1;         /* 1=vertical, 3=horizontal */
```

Expected behavior:

- The nav root receives the computed variable set after config load.
- Child components consume only semantic variables, not raw config fields.
- When config changes, the injected variables are updated and the nav re-renders without a full page refresh.

## Font Families Supported

Available options in the settings picker:

- `system-ui` (default)
- `'Segoe UI'` (SharePoint default)
- `Georgia`
- `'Times New Roman'`
- `'Courier New'`
- `'BIZ UDPGothic'` (Japanese)
- `'Noto Sans JP'` (Japanese, requires Google Fonts)

Notes:

- `system-ui` is the safest cross-platform fallback.
- `'Segoe UI'` aligns with the default Microsoft 365 look and feel.
- `'Noto Sans JP'` requires the font asset to be available; custom fonts must be handled through SharePoint theme or asset customization.

## Config Storage

Configuration is stored in the SharePoint web property bag.

- Key: `OrigamiNavConfig`
- Value: JSON string matching the `NavConfig` interface

Example shape:

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

### Manual Reset

To reset configuration manually:

1. Open the target site with an account that can edit web properties.
2. Clear or delete the `OrigamiNavConfig` value from the property bag.
3. Reload the page so the customizer falls back to defaults.

### Migration Strategy

Include a numeric `version` field in every stored config object.

- Current schema version: `1`
- On load, `useNavConfig` checks the stored version.
- If the version is older, run a migration function that fills defaults, renames fields if needed, and writes back the upgraded schema.
- If the stored payload is invalid, log the issue and use defaults instead of crashing the customizer.

## Dark Mode

The navigation does not auto-switch when SharePoint or the browser uses dark mode. Colors always come from explicit settings. This is intentional to preserve brand consistency across sites and languages.
