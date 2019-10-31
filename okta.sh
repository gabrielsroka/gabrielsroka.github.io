#!/bin/bash

# 1. Sign in to Okta (see below). Use cookies to maintain state for all future steps.
# 2. Sign in to the AWS ALB using OIDC (OAuth) using Okta (with cookies from step 1).
# 3. Sign in to gitlab (OSS) using SAML using Okta (with cookies from step 1).
# 4. git clone (use cookies from step 3). https://git-scm.com/docs/git-config
# 5. profit

URL="https://YOUR_ORG.oktapreview.com"
USERNAME="YOUR_USERNAME"

flags="-b cookies -c cookies -s"

echo URL: $URL
echo Username: $USERNAME
read -s -p "Password: " PASSWORD
echo
echo

echo Signing In...
json="Content-Type: application/json"
AUTHN=$(curl $flags -H "$json" -d '{"username":"'$USERNAME'","password":"'$PASSWORD'"}' "$URL/api/v1/authn")
STATUS=$(echo $AUTHN | jq -r .status)

if [ $STATUS == "null" ]; then
    echo $AUTHN | jq -r .errorSummary
    exit
elif [ $STATUS == "MFA_REQUIRED" ]; then
    PUSH=$(echo $AUTHN | jq -r '._embedded.factors[] | select(.factorType == "push")._links.verify.href')
    echo Push MFA...
    while true; do
        STATE=$(echo $AUTHN | jq -r .stateToken)
        AUTHN=$(curl $flags -H "$json" -d '{"stateToken":"'$STATE'"}' $PUSH)
        STATUS=$(echo $AUTHN | jq -r .status)
        RESULT=$(echo $AUTHN | jq -r .factorResult)
        if [ $RESULT == "WAITING" ]; then
            sleep 4s
            echo Waiting...
        elif [ $RESULT == "REJECTED" ]; then
            echo Push Rejected
            exit
        elif [ $STATUS == "SUCCESS" ]; then
            break
        fi
    done
fi

TOKEN=$(echo $AUTHN | jq -r .sessionToken)

curl $flags "$URL/login/sessionCookieRedirect?token=$TOKEN&redirectUrl=/"

echo Calling API...
curl $flags "$URL/api/v1/users/me" | jq
echo

# Sign out.
rm cookies
