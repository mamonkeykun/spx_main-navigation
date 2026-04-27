# Features

## 1. Top Navigation Bar Rendering

### Description

Render a custom top navigation bar through an SPFx Application Customizer in the Header placeholder. The bar owns branding, top-level labels, and site-level visual settings.

### Acceptance Criteria

- The navigation renders through the Application Customizer, not as a page-authored web part.
- The nav mounts in the Header placeholder on modern SharePoint pages.
- A logo area is shown on the left and supports either an image URL or fallback text.
- Top-level navigation labels are displayed across the bar in configured sort order.
- Admins can configure nav height, background color, and text color in the Settings Web Part.

### Edge Cases

- Missing Header placeholder delays render until the placeholder becomes available.
- Missing logo URL falls back to configured site or product text.
- Invalid color values are rejected before save and defaults remain active.

## 2. Multi-Level Dropdown Menus

### Description

Allow users to open folder-based dropdown menus from top-level nav labels, with vertical and horizontal layout modes.

### Acceptance Criteria

- Hover or click opens a dropdown for a folder that contains children.
- Vertical layout renders as a single-column list.
- Horizontal layout renders as a CSS Grid with 3 to 4 columns depending on item count and available width.
- Each nav item can show a description as a subtitle.
- Pressing `Escape` closes the currently open dropdown and returns focus to its trigger.

### Edge Cases

- Empty folders do not open a dropdown.
- Long labels wrap without overlapping adjacent items.
- Rapid pointer movement does not leave multiple dropdowns open.

## 3. Permission-Based Targeting

### Description

Support folder- and item-level visibility control based on SharePoint group membership.

### Acceptance Criteria

- Folders and items expose an `allowedGroups` property.
- Items with no groups are visible to all users.
- Items with groups are shown only when the current user belongs to at least one listed group.
- User groups are loaded from `sp.web.currentUser.groups()`.
- Hidden items leave no empty gaps in the rendered layout.

### Edge Cases

- Duplicate group names in config are de-duplicated before evaluation.
- Missing or malformed group JSON fails open and logs a warning.
- A hidden folder hides all of its children even if a child item would otherwise match.

## 4. Cross-Site Shared Navigation

### Description

Allow one site to consume navigation data maintained on another SharePoint site.

### Acceptance Criteria

- Settings include a `sourceUrl` field.
- When `sourceUrl` is populated, the nav fetches the `Navigation` list from that site.
- Permission checks still evaluate against the current signed-in user.
- The source site URL is validated before save.

### Edge Cases

- Invalid or inaccessible source URLs fall back to local nav.
- Relative URLs are normalized to absolute URLs before validation.
- A source site that lacks the `Navigation` list shows a setup error.

## 5. Visual Customization

### Description

Allow administrators to control nav branding and presentation without code changes.

### Acceptance Criteria

- Settings include background color, text color, hover color, and accent color.
- Settings include a font family picker with approved fonts.
- Settings include font size options `small`, `medium`, and `large`.
- Settings include logo URL and logo size options `small`, `medium`, and `large`.

### Edge Cases

- Broken logo URLs fall back to text branding.
- Unsupported fonts degrade to the configured fallback stack.
- Extreme color combinations are blocked if they violate accessibility validation.

## 6. Hide SharePoint Navigation

### Description

Provide a reversible toggle to suppress native SharePoint navigation chrome when the custom nav is active.

### Acceptance Criteria

- CSS injection hides SharePoint hub nav, suite bar, and site nav when enabled.
- A settings toggle turns the behavior on or off.
- Disabling the toggle removes the injected CSS and restores native nav.

### Edge Cases

- SharePoint DOM changes are isolated behind selectors owned by the injection utility.
- The injected CSS is added once and not duplicated across re-renders.
- If CSS injection fails, the custom nav still renders.

## 7. Breadcrumb

### Description

Render a breadcrumb below the top nav based on the current page URL and known nav item hierarchy.

### Acceptance Criteria

- Breadcrumb is displayed below the nav bar when enabled.
- The path is computed from the current URL matched against nav item URLs.
- Parent segments are clickable links.
- Breadcrumb font size is configurable.
- A settings toggle enables or disables the breadcrumb.

### Edge Cases

- Pages with no matching nav item show either a minimal home breadcrumb or no breadcrumb based on config.
- Query strings and trailing slashes do not break path matching.
- Cross-site nav links still resolve breadcrumb labels correctly.

## 8. Language Picker

### Description

Expose multilingual site language switching from within the custom navigation.

### Acceptance Criteria

- The language picker renders only when `showLanguagePicker: true`.
- Available languages are read from SharePoint multilingual settings.
- The current language is visually highlighted.
- Clicking a language triggers the SharePoint language switch flow.

### Edge Cases

- Sites with multilingual disabled hide the picker even if the toggle is on.
- A failed language fetch shows no picker and logs a recoverable error.
- Unsupported locale labels fall back to locale codes.

## 9. Settings Web Part

### Description

Provide an admin-facing UI for visual, layout, and data source settings with immediate feedback.

### Acceptance Criteria

- Admins can edit colors, fonts, and sizes.
- Admins can change dropdown direction and breadcrumb settings.
- Admins can set a cross-site `sourceUrl`.
- The UI provides a live preview of color and font changes before save.

### Edge Cases

- Unsaved changes are clearly distinguishable from persisted config.
- Concurrent edits from multiple admins prefer last successful save.
- Invalid config values are blocked with inline validation.

## 10. Nav Item Manager

### Description

Allow administrators to manage folders, links, ordering, and targeting from the Settings Web Part.

### Acceptance Criteria

- The manager lists all folders and items.
- Admins can add, edit, and delete folders.
- Admins can add, edit, and delete items.
- Drag and drop supports reorder and moving items into folders.
- Folders and items support allowed-group assignment.

### Edge Cases

- Reordering persists immediately or on explicit save, but never silently discards changes.
- Deleting a folder with children prompts for confirmation and defines child handling.
- Moving an item across folders recalculates order values deterministically.
