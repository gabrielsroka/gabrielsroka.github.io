# Call this before calling Okta API functions.
function Connect-Okta($token, $baseUrl) {
    $script:settings = @{
        headers = @{"Authorization" = "SSWS $token"; "Accept" = "application/json"; "Content-Type" = "application/json"};
        baseUrl = "$baseUrl/api/v1";
        userAgent = "OktaAPIWindowsPowerShell/0.1"
    }
}

# User functions - http://developer.okta.com/docs/api/resources/users.html

# $user = New-OktaUser @{profile = @{login = $login; email = $email; firstName = $firstName; lastName = $lastName}}
function New-OktaUser($user, $activate = $true) {
    Invoke-Method POST "/users?activate=$activate" $user
}

function Get-OktaUser($id) {
    Invoke-Method GET "/users/$id"
}

function Get-OktaUsers($q, $filter, $limit = 200) {
    Invoke-Method GET "/users?q=$q&filter=$filter&limit=$limit"
}

function Set-OktaUser($id, $user) {
# Only the profile properties specified in the request will be modified when using the POST method.
    Invoke-Method POST "/users/$id" $user
}

function Enable-OktaUser($id, $sendEmail = $true) {
    Invoke-Method POST "/users/$id/lifecycle/activate?sendEmail=$sendEmail"
}

# Group functions - http://developer.okta.com/docs/api/resources/groups.html

# $group = New-OktaGroup @{profile = @{name = "a group"; description = "its description"}}
function New-OktaGroup($group) {
    Invoke-Method POST "/groups" $group
}

function Get-OktaGroup($id) {
    Invoke-Method GET "/groups/$id"
}

# $groups = Get-OktaGroups "PowerShell" 'type eq "OKTA_GROUP"'
function Get-OktaGroups($q, $filter, $limit = 200) {
    Invoke-Method GET "/groups?q=$q&filter=$filter&limit=$limit"
}

function Get-OktaGroupMember($id) {
    Invoke-Method GET "/groups/$id/users"
}

function Add-OktaGroupMember($groupid, $userid) {
    $noContent = Invoke-Method PUT "/groups/$groupid/users/$userid"
}

# Event functions - http://developer.okta.com/docs/api/resources/events.html

function Get-OktaEvents($startDate, $filter, $limit = 1000) {
    Invoke-Method GET "/events?startDate=$startDate&filter=$filter&limit=$limit"
}

# Core functions

function Invoke-Method($method, $path, $body) {
    $url = $script:settings.baseUrl + $path
    $jsonBody = ConvertTo-Json -compress $body
    Invoke-RestMethod $url -Method $method -Headers $script:settings.headers -Body $jsonBody -UserAgent $settings.userAgent
}

function Invoke-PagedMethod($url) {
    if ($url -notMatch '^http') {$url = $script:settings.baseUrl + $url}
    $script:response = $null # Clear old value.
    $script:response = Invoke-WebRequest $url -Method GET -Headers $script:settings.headers -UserAgent $settings.userAgent
    ConvertFrom-Json $script:response.content
}

function Get-Links() {
    $links = @{}
    foreach ($header in $script:response.Headers.Link.split(",")) {
        $header -match '<(.*)>; rel="(.*)"'
        $links[$matches[2]] = $matches[1]
    }
    $links
}

function Get-NextUrl() {
    $links = Get-Links
    $links.next
}

function Get-Error($_) {
    $responseStream = $_.Exception.Response.GetResponseStream()
    $responseReader = New-Object System.IO.StreamReader($responseStream)
    $response = $responseReader.ReadToEnd()
    ConvertFrom-Json $response
}
