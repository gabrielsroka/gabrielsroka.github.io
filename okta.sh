#!/bin/bash

# Change these settings:
oktaUrl="https://YOUR_ORG.oktapreview.com"
username="YOUR_USERNAME"

# 1. Sign in to Okta (see below). Use cookies to maintain state for all future steps.
# 2. Sign in to the AWS ALB using OIDC (OAuth) using Okta (with cookies from step 1).
# 3. Sign in to gitlab (OSS) using SAML using Okta (with cookies from step 1).
#    or use a Personal Access Token: https://gitlab.com/help/user/profile/personal_access_tokens.md
#    see also: https://gitlab.com/profile/personal_access_tokens
# 4. git clone (use cookies or token from step 3). https://git-scm.com/docs/git-config
# 5. profit

flags="-b cookies -c cookies -s"
json="Content-Type: application/json"

function main() {
    getPassword
    signIn
    getUser
    signOut
}

function getPassword() {
    echo URL: $oktaUrl
    echo Username: $username
    read -s -p "Password: " password
    echo
    echo
}

function signIn() {
    echo Signing In...
    authn=$(curl $flags -H "$json" -d '{"username":"'$username'","password":"'$password'"}' "$oktaUrl/api/v1/authn")
    local status=$(echo $authn | jq -r .status)

    if [ $status == "MFA_REQUIRED" ]; then
        pushMFA
    elif [ $status == "null" ]; then
        echo $authn | jq -r .errorSummary
        signOut
    fi

    local token=$(echo $authn | jq -r .sessionToken)
    curl $flags "$oktaUrl/login/sessionCookieRedirect?token=$token&redirectUrl=/"
}

function pushMFA() {
    echo Push MFA...
    local pushUrl=$(echo $authn | jq -r '._embedded.factors[] | select(.factorType == "push")._links.verify.href')
    while true; do
        local state=$(echo $authn | jq -r .stateToken)
        authn=$(curl $flags -H "$json" -d '{"stateToken":"'$state'"}' $pushUrl)
        local status=$(echo $authn | jq -r .status)
        local result=$(echo $authn | jq -r .factorResult)
        if [ $status == "SUCCESS" ]; then
            break
        elif [ $result == "WAITING" ]; then
            sleep 4s
            echo Waiting...
        elif [ $result == "REJECTED" ]; then
            echo Push Rejected
            signOut
        fi
    done
}

function getUser() {
    echo Getting user...
    curl $flags "$oktaUrl/api/v1/users/me" | jq
    echo
}

function signOut() {
    echo Signing out...
    rm cookies
    exit
}

# This needs to be the last line in the file.
main
