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
3. Keep the deployment site-scoped if you want to control which sites use the top navigation.
4. Confirm deployment.

Suggested screenshot references for internal documentation packs:

- Screenshot 1: App Catalog library upload view
- Screenshot 2: Deployment confirmation dialog
- Screenshot 3: Tenant-wide deployment checkbox

## Activating on a Site

1. Open `Site Settings`.
2. Go to `Add an App`.
3. Find `Origami 風トップナビゲーション`.
4. Install the app.
5. Add the `ナビゲーション設定` Web パーツ to an admin page for configuration.
6. Run `scripts\provision-navigation-list.ps1` if the `Navigation` list does not exist yet.
7. Run `scripts\install-customizer.ps1` to enable the top bar on the site.

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

```

Folders are used as top-level navigation labels. Create folders directly in the `Navigation` list and move link items into those folders. Visibility is controlled by standard SharePoint item or folder permissions.

## Updating an Existing Deployment

1. Increment the version in `config/package-solution.json`.
2. Re-run the production build steps.
3. Upload the new `.sppkg` and overwrite the existing package.
4. Click `Replace it` in the App Catalog.
5. If the site already has the app installed and the customizer registered, no extra site action is needed.

## Rollback

1. Upload the previous `.sppkg` version and replace the current package.
2. If necessary, remove the app from the App Catalog entirely to remove it from sites.

Rollback note:

- Removing the package stops future loads of the extension, but any site configuration data in the `Navigation` list and `OrigamiNavConfig` property remains until explicitly removed.

## スクリプトを使った展開

前提条件:

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
```

使用順序:

1. `.sppkg` をビルドして App Catalog にアップロードする
2. 各対象サイトで `provision-navigation-list.ps1` を実行する
3. 各対象サイトで `install-customizer.ps1` を実行する
4. 各サイトの管理ページに `ナビゲーション設定` Web パーツを追加する

使用例:

```powershell
.\scripts\provision-navigation-list.ps1 -SiteUrl "https://tenant.sharepoint.com/sites/intranet"
.\scripts\install-customizer.ps1 -SiteUrl "https://tenant.sharepoint.com/sites/intranet" -CustomizerGuid "77c3bb9a-cfce-4f3d-b519-2f9a548e6cbc"
.\scripts\remove-customizer.ps1 -SiteUrl "https://tenant.sharepoint.com/sites/intranet" -CustomizerGuid "77c3bb9a-cfce-4f3d-b519-2f9a548e6cbc"
```
