// apitoken comes from Okta Admin > Security > API > Create Token
// see http://developer.okta.com/docs/api/getting_started/getting_a_token.html

// Tokens are valid for 30 days and automatically refresh with each API call. 
// Tokens that are not used for 30 days will expire.

// Replace YOUR_API_TOKEN and YOUR_ORG with your values.
var baseurl = "https://YOUR_ORG.oktapreview.com";
var apitoken = "YOUR_API_TOKEN";
