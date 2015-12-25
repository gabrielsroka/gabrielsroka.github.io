. .\OktaAPI.ps1
. .\OktaAPISettings.ps1

<# Sample CSV file. Make sure you include the header line as the first record--it's case-sensitive.
login,email,firstName,lastName,groupid
testa1@okta.com,testa1@okta.com,Test,A1,00g5gtwaaeOe7smEF0h7
testa2@okta.com,testa2@okta.com,Test,A2,00g5gtwaaeOe7smEF0h7
#>
<#
# Read users from CSV, create them in Okta, and add to a group.
$users = Import-Csv users.csv
$importedUsers = @()
foreach ($user in $users) {
 $profile = @{login = $user.login; email = $user.email; firstName = $user.firstName; lastName = $user.lastName}
 $message = ""
 try {
  $oktaUser = New-OktaUser @{profile = $profile} $false
 } catch {
  try {
   $oktaUser = Get-OktaUser $user.login
  } catch {
   $oktaUser = $null
   $message = "Invalid user."
  }
 }
 if ($oktaUser) {
  try {
   Add-OktaGroupMember $user.groupid $oktaUser.id
  } catch {
   $message = "Invalid group."
  }
 }
 $importedUsers += [PSCustomObject]@{id = $oktaUser.id; login = $user.login; message = $message}
}
$importedUsers | Export-Csv importedUsers.csv -notype
"$($users.count) users read."
#>

<# Sample CSV file. Make sure you include the header line as the first record--it's case-sensitive.
login,email,firstName,lastName
testa1@okta.com,testa1@okta.com,Test,A1
testa2@okta.com,testa2@okta.com,Test,A2
#>
<#
# Read users from CSV, create them in Okta, and add to a group.
$csvUsers = Import-Csv users.csv
$groupid = "00g5gtwaaeOe7smEF0h7"
foreach ($csvUser in $csvUsers) {
 $oktaUser = New-OktaUser @{profile = $csvUser} $false
 Add-OktaGroupMember $groupid $oktaUser.id
}
#>


<#
$me = Get-OktaUser "me"
$group = Get-OktaGroups "PowerShell" 'type eq "OKTA_GROUP"'
Add-OktaGroupMember $group.id $me.id
#>

<#
$ids = "me#jane.doe".split("#")
foreach ($id in $ids) {
 $user = Get-OktaUser $id
}
#>

<#
# Create some test users.
for ($i = 1; $i -le 3; $i++) {
 $date = Get-Date -Format "yyyyMMddHHmmss"
 $user = @{profile = @{login="a$date$i@okta.com"; email="testuser$i@okta.com"; firstName="test"; lastName="a$i"}}
 try {
  New-OktaUser $user $false
 } catch {
  Get-Error $_
 }
}
#>

# Enable-OktaUser testuser $false

<#
$users = Get-OktaUsers "test"
# $oktaCredUsers = $users | where {$_.credentials.provider.type -eq "OKTA"}
"$($users.count) users found."
foreach ($user in $users) {
 if ($user.credentials.provider.type -eq "OKTA") {
  Set-OktaUser $user.id @{profile = @{lastName = "z"}}
 }
}
#>

<#
# Pagination using Invoke-PagedMethod and Get-NextUrl.
$totalUsers = 0
$url = "/users?limit=5"
do {
 $users = Invoke-PagedMethod $url
 foreach ($user in $users) {
  Write-Host $user.profile.login $user.credentials.provider.type
 }
 $totalUsers += $users.count
 $url = Get-NextUrl
} while ($url)
"$totalUsers users found."
#>

<#
Get-OktaEvents -filter 'published gt "2015-12-21T16:00:00.000-08:00"'
$events = Get-OktaEvents "2015-12-21T00:00:00.000-08:00"
#>
