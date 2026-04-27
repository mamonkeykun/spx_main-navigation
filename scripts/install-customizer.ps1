#Requires -Modules PnP.PowerShell
<#
.SYNOPSIS
    Installs the Top Navigation Application Customizer on a site.

.PARAMETER SiteUrl
    Target SharePoint site URL.

.PARAMETER CustomizerGuid
    The component ID from the Application Customizer manifest.

.PARAMETER Tenant
    Use -Tenant to install tenant-wide instead of site-specific.
#>
param(
  [Parameter(Mandatory)]
  [string]$SiteUrl,
  [Parameter(Mandatory)]
  [string]$CustomizerGuid,
  [switch]$Tenant
)

Connect-PnPOnline -Url $SiteUrl -Interactive

if ($Tenant) {
  # Tenant-wide deployment relies on App Catalog deployment with skipFeatureDeployment=true.
  Write-Host "Tenant-wide deployment is not automated by this script."
  Write-Host "Upload the package to the App Catalog, deploy it tenant-wide, and configure the tenant sequence or site associations manually."
  return
}

Add-PnPCustomAction `
  -ClientSideComponentId $CustomizerGuid `
  -Name "TopNavigation" `
  -Title "Top Navigation" `
  -Location "ClientSideExtension.ApplicationCustomizer" `
  -Scope Site

$installedAction = Get-PnPCustomAction -Scope Site | Where-Object {
  $_.ClientSideComponentId -eq $CustomizerGuid
}

if ($installedAction) {
  Write-Host "Top Navigation customizer installed successfully on $SiteUrl"
}
