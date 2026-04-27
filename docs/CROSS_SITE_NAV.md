# Cross-Site Navigation

## Use Case

Cross-site navigation allows multiple SharePoint sites, such as hub sites and department sites, to display one centrally managed navigation structure without copying or synchronizing list data between sites.

## Architecture

- The main site hosts the `Navigation` list and acts as the source of truth.
- Child sites have the Application Customizer installed locally.
- Each child site stores a `sourceUrl` in `OrigamiNavConfig`.
- PnPjs resolves the remote site and fetches nav data from the main site URL.
- Permissions remain user-specific: the current user's access to the main site's `Navigation` list items determines what can be loaded and displayed.

Operational model:

- Layout and theming remain site-specific because config is read from each child site's property bag.
- Content can be centralized while branding can remain local if desired.
- If `sourceUrl` is blank, the current site list is used.

## Setup Steps for Admins

1. Set up the `Navigation` list on the main site.
2. Install the Application Customizer on the child site.
3. Add the Settings Web Part to an admin page on the child site.
4. Enter the main site URL in the `Source URL` field.
5. Click validate and confirm the previewed nav items are correct.
6. Save the configuration.

## Caveats

- The current user must have read access to the main site's `Navigation` list.
- Any images or logos referenced by absolute URL must also be accessible from the child site context.
- Cross-site mode adds one extra API call on page load.
- The child site and source site should be in the same tenant unless the SPFx permission model explicitly supports the remote call.

## Error Handling

### Invalid URL

Show a validation error in the Settings Web Part and prevent save.

### Inaccessible URL (403)

Show an error message, record diagnostic detail in the console, and fall back to local navigation data.

### Timeout Greater Than 5 Seconds

Abort the remote fetch, show a warning toast, and fall back to local navigation data.
