// ==UserScript==
// @name           rockstar
// @namespace      https://gabrielsroka.github.io/
// @description    Export Okta Users, Groups, etc. to CSV. Show SAML assertion. And so much more.
// @version        2020.2.21.1100
// @include        https://*.okta.com/*
// @include        https://*.okta-emea.com/*
// @include        https://*.oktapreview.com/*
// @require        https://code.jquery.com/jquery-1.12.4.min.js
// ==/UserScript==

(function () {
    document.body.appendChild(document.createElement("script")).src = "https://gabrielsroka.github.io/rockstar/rockstar.js";
}
)();
