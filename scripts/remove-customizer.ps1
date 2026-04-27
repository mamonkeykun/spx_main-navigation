#Requires -Modules PnP.PowerShell
param(
  [Parameter(Mandatory)]
  [string]$SiteUrl,
  [Parameter(Mandatory)]
  [string]$CustomizerGuid
)

Connect-PnPOnline -Url $SiteUrl -Interactive

$customAction = Get-PnPCustomAction -Scope Site | Where-Object {
  $_.ClientSideComponentId -eq $CustomizerGuid
}

if ($customAction) {
  Remove-PnPCustomAction -Identity $customAction.Id -Scope Site -Force
}

Write-Host "Top Navigation customizer removal complete for $SiteUrl"
