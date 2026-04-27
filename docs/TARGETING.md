# Targeting

## How It Works

1. The Application Customizer initializes on page load.
2. The `useCurrentUser` hook calls `sp.web.currentUser.groups()`.
3. The hook returns an array of SharePoint group `LoginName` values for the current user.
4. `useNavFilter` compares each folder and item `allowedGroups` array against the user's group list.
5. Only matching items are passed into the render tree.

The filtering rule is inclusive:

- Empty `allowedGroups` means visible to everyone.
- Non-empty `allowedGroups` means visible when at least one configured group matches.

## SharePoint List Setup

Use a multiple-lines-of-text column named `NavAllowedGroups`.

- Column internal name: `NavAllowedGroups`
- Column type: Multiple lines of text
- Expected value format: JSON array of SharePoint group login names

Example:

```json
["i:0#.f|membership|hr-team@tenant.onmicrosoft.com", "Navigation Members"]
```

Interpretation rules:

- `[]` means visible to all users.
- Missing or blank values are treated the same as `[]`.
- Values should be trimmed and stored exactly as SharePoint returns them to avoid case or formatting mismatches.

### How to Find a Group LoginName

1. Open the target SharePoint site.
2. Go to `Site settings`.
3. Open `Site permissions`.
4. Select the target SharePoint group.
5. Inspect the group details page or query the groups API using the browser network tab or a PnPjs script.
6. Copy the exact `LoginName` returned by SharePoint and store it in the JSON array.

## Edge Cases

### Guest Users

Guest users often resolve with no site group memberships. In that case, they only see items whose `allowedGroups` is empty.

### Hidden Folder With Visible Children

If a folder itself is not visible, its children are also hidden. Folder visibility is evaluated before item visibility to avoid exposing orphaned links.

### Slow Group API Response

The UI should show a loading skeleton while group membership is loading. Once the response arrives, filtered nav content replaces the skeleton.

### API Error

If the group lookup fails, the filter fails open and shows all items. A console warning is logged so the failure is discoverable during support.

## Performance

- Fetch current user groups once on mount.
- Cache the result in component state or a shared hook state.
- Do not re-fetch groups on nav clicks or dropdown interactions.
- If `sourceUrl` is set, still fetch groups from the current site because visibility is evaluated against the current user context, not the source site.
