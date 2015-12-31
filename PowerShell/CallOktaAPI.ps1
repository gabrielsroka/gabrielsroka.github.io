Import-Module OktaAPI

.\OktaAPISettings.ps1

# This file contains functions with sample code. To use one, call it.

# Read users from CSV, create them in Okta, and add to a group.
function Import-Users {
<# Sample users.csv file with 5 fields. Make sure you include the header line as the first record.
login,email,firstName,lastName,groupid
testa1@okta.com,testa1@okta.com,Test,A1,00g5gtwaaeOe7smEF0h7
testa2@okta.com,testa2@okta.com,Test,A2,00g5gtwaaeOe7smEF0h7
#>
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
    $importedUsers | Export-Csv importedUsers.csv -NoTypeInformation
    "$($users.count) users read."
}

function New-Users {
    for ($i = 1; $i -le 3; $i++) {
        $now = Get-Date -Format "yyyyMMddHHmmss"
        $profile = @{login="a$now$i@okta.com"; email="testuser$i@okta.com"; firstName="test"; lastName="a$i"}
        try {
            New-OktaUser @{profile = $profile} $false
        } catch {
            Get-Error $_
        }
    }
}

function Add-GroupMember {
    $me = Get-OktaUser "me"
    $group = Get-OktaGroups "PowerShell" 'type eq "OKTA_GROUP"'
    Add-OktaGroupMember $group.id $me.id
}

function Rename-Users {
    $page = Get-OktaUsers "test"
    $users = $page.objects
    # $oktaCredUsers = $users | where {$_.credentials.provider.type -eq "OKTA"}
    foreach ($user in $users) {
        if ($user.credentials.provider.type -eq "OKTA") {
            Set-OktaUser $user.id @{profile = @{lastName = "z"}}
        }
    }
    "$($users.count) users found."
}

function Get-PagedUsers {
    $totalUsers = 0
    $params = @{limit = 25}
    do {
        $page = Get-OktaUsers @params
        $users = $page.objects
        foreach ($user in $users) {
            Write-Host $user.profile.login $user.credentials.provider.type
        }
        $totalUsers += $users.count
        $params = @{url = $page.nextUrl}
    } while ($page.nextUrl)
    "$totalUsers users found."
}

function Get-Events {
    $today = Get-Date -Format "yyyy-MM-dd"
    Get-OktaEvents "$($today)T00:00:00.0-08:00"
    # Get-OktaEvents -filter 'published gt "2015-12-21T16:00:00.0-08:00"'
}

<#
$ids = "me#jane.doe".split("#")
foreach ($id in $ids) {
    $user = Get-OktaUser $id
}
#>
