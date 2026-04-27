#Requires -Modules PnP.PowerShell
<#
.SYNOPSIS
    Provisions the Navigation list required by SPFx Top Navigation.

.DESCRIPTION
    Creates the Navigation SharePoint list with all required columns.
    Safe to run multiple times — skips steps that are already complete.

.PARAMETER SiteUrl
    The SharePoint site URL to provision the list on.

.EXAMPLE
    .\provision-navigation-list.ps1 -SiteUrl "https://tenant.sharepoint.com/sites/intranet"
#>
param(
  [Parameter(Mandatory)]
  [string]$SiteUrl
)

Connect-PnPOnline -Url $SiteUrl -Interactive

$listTitle = "Navigation"
$list = Get-PnPList -Identity $listTitle -ErrorAction SilentlyContinue

if (-not $list) {
  Write-Host "Creating Navigation list..."
  $list = New-PnPList -Title $listTitle -Template GenericList
}

Set-PnPList -Identity $listTitle -EnableFolderCreation $true

$fields = @(
  @{ DisplayName = "URL"; InternalName = "NavUrl"; Type = "Text"; AddToDefaultView = $true },
  @{ DisplayName = "Description"; InternalName = "NavDescription"; Type = "Text"; AddToDefaultView = $true },
  @{ DisplayName = "Order"; InternalName = "NavOrder"; Type = "Number"; AddToDefaultView = $true },
  @{ DisplayName = "Folder ID"; InternalName = "NavFolderId"; Type = "Number"; AddToDefaultView = $true },
  @{ DisplayName = "Allowed groups"; InternalName = "NavAllowedGroups"; Type = "Note"; AddToDefaultView = $true },
  @{ DisplayName = "Open in new tab"; InternalName = "NavOpenInNewTab"; Type = "Boolean"; AddToDefaultView = $true }
)

foreach ($field in $fields) {
  $existingField = Get-PnPField -List $listTitle -Identity $field.InternalName -ErrorAction SilentlyContinue
  if (-not $existingField) {
    Add-PnPField -List $listTitle `
      -DisplayName $field.DisplayName `
      -InternalName $field.InternalName `
      -Type $field.Type `
      -AddToDefaultView:$field.AddToDefaultView | Out-Null
  }
}

Set-PnPField -List $listTitle -Identity "NavOrder" -Values @{ DefaultValue = "0" } | Out-Null
Set-PnPField -List $listTitle -Identity "NavOpenInNewTab" -Values @{ DefaultValue = "0" } | Out-Null

Set-PnPList -Identity $listTitle -BreakRoleInheritance -CopyRoleAssignments -ClearSubscopes

$visitorsGroup = Get-PnPGroup | Where-Object { $_.Title -like "*Visitors*" -or $_.Title -like "*Members*" } | Select-Object -First 1
if ($visitorsGroup) {
  Set-PnPListPermission -Identity $listTitle -Group $visitorsGroup.Title -AddRole "Read"
}

$listUrl = "$SiteUrl/Lists/$listTitle"
Write-Host "Navigation list provisioned successfully: $listUrl"
