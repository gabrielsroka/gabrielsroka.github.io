//Greasemonkey:

// ==UserScript==
// @name           InC Parts
// @namespace      http://webpages.charter.net/gabrielsroka
// @include        http://www.incommonfederation.org/participants/
// @include        http://www.incommon.org/participants/
// ==/UserScript==

(function () {
	var script = document.body.appendChild(document.createElement("script"));
	script.src = "http://webpages.charter.net/gabrielsroka/scripts/showCampuses.js";
	script.type = "text/javascript";
	script.id = "gabrielsroka_showCampuses";
}
)();
