// ==UserScript==
// @name           rockstar
// @namespace      https://gabrielsroka.github.io/
// @description    Export Okta Users, Groups, etc. to CSV. Show SAML assertion. And so much more.
// @version        2024.06.11.1100
// @include        https://*.okta.com/*
// @include        https://*.okta-emea.com/*
// @include        https://*.okta-gov.com/*
// @include        https://*.oktapreview.com/*
// @require        https://gabrielsroka.github.io/rockstar/jquery-1.12.4.min.PATCHED.js
// ==/UserScript==

(function () {
  document.body.appendChild(document.createElement("script")).src = "https://gabrielsroka.github.io/rockstar/rockstar.js";
  const link = document.head.appendChild(document.createElement('link'));
  link.href = 'https://gabrielsroka.github.io/rockstar/rockstar.css'; 
  link.rel = 'stylesheet';
}
)();
