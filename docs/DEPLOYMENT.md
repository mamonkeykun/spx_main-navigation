# Deployment

## Environment Types

- `development`: local workbench via `gulp serve`
- `staging`: SharePoint test tenant
- `production`: SharePoint production tenant

## Build Steps

```bash
# Development (hot reload)
gulp serve

# Production build
gulp clean
gulp build --ship
gulp bundle --ship
gulp package-solution --ship
# Output: sharepoint/solution/top-navigation-solution.sppkg
```

## App Catalog Deployment

1. Navigate to the tenant App Catalog.
2. Upload the generated `.sppkg` package.
3. Choose whether to make the solution tenant-wide or keep it site-specific.
4. Confirm deployment.

Suggested screenshot references for internal documentation packs:

- Screenshot 1: App Catalog library upload view
- Screenshot 2: Deployment confirmation dialog
- Screenshot 3: Tenant-wide deployment checkbox

## Activating on a Site

For tenant-wide deployment:

- The package is available automatically on all supported sites.
- The Application Customizer can be associated through tenant-wide deployment settings or site-level registration, depending on the SPFx packaging strategy.

For site-specific deployment:

1. Open `Site Settings`.
2. Go to `Add an App`.
3. Find `Top Navigation Solution`.
4. Install the app.
5. Create the `Navigation` list if provisioning has not done so automatically.
6. Add the Settings Web Part to an admin page for configuration.

## Navigation List Provisioning

Use PnP PowerShell to create and prepare the `Navigation` list.

```powershell
param(
  [Parameter(Mandatory = $true)]
  [string]$SiteUrl
)

Connect-PnPOnline -Url $SiteUrl -Interactive

$listTitle = "Navigation"
$existing = Get-PnPList -Identity $listTitle -ErrorAction SilentlyContinue

if (-not $existing) {
  New-PnPList -Title $listTitle -Template GenericList -OnQuickLaunch:$false
}

Set-PnPList -Identity $listTitle -EnableFolderCreation $true

$fields = @(
  @{ DisplayName = "URL"; InternalName = "NavUrl"; Type = "Text" },
  @{ DisplayName = "Description"; InternalName = "NavDescription"; Type = "Text" },
  @{ DisplayName = "Order"; InternalName = "NavOrder"; Type = "Number" },
  @{ DisplayName = "Folder ID"; InternalName = "NavFolderId"; Type = "Number" },
  @{ DisplayName = "Allowed groups"; InternalName = "NavAllowedGroups"; Type = "Note" },
  @{ DisplayName = "Open in new tab"; InternalName = "NavOpenInNewTab"; Type = "Boolean" }
)

foreach ($field in $fields) {
  $fieldExists = Get-PnPField -List $listTitle -Identity $field.InternalName -ErrorAction SilentlyContinue
  if (-not $fieldExists) {
    Add-PnPField -List $listTitle `
      -DisplayName $field.DisplayName `
      -InternalName $field.InternalName `
      -Type $field.Type `
      -AddToDefaultView
  }
}

# Example: break inheritance and grant read to members, edit to owners.
Set-PnPList -Identity $listTitle -BreakRoleInheritance -CopyRoleAssignments -ClearSubscopes
Set-PnPListPermission -Identity $listTitle -Group "Site Members" -AddRole "Read"
Set-PnPListPermission -Identity $listTitle -Group "Site Owners" -AddRole "Edit"
```

Review the group names for the target site before running the permission commands. Some tenants use localized default group names.

## Updating an Existing Deployment

1. Increment the version in `config/package-solution.json`.
2. Re-run the production build steps.
3. Upload the new `.sppkg` and overwrite the existing package.
4. Click `Replace it` in the App Catalog.
5. No user action is needed; the extension updates automatically after SharePoint propagates the new package.

## Rollback

1. Upload the previous `.sppkg` version and replace the current package.
2. If necessary, remove the app from the App Catalog entirely to remove it from sites.

Rollback note:

- Removing the package stops future loads of the extension, but any site configuration data in the `Navigation` list and `OrigamiNavConfig` property remains until explicitly removed.
