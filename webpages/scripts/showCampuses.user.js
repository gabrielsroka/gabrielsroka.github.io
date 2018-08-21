//Greasemonkey:

// ==UserScript==
// @name           InC Parts
// @namespace      https://gabrielsroka.github.io/
// @include        http://www.incommonfederation.org/participants/
// @include        http://www.incommon.org/participants/
// ==/UserScript==

(function () {
	var script = document.body.appendChild(document.createElement("script"));
	script.src = "https://gabrielsroka.github.io/webpages/scripts/showCampuses.js";
	script.type = "text/javascript";
	script.id = "gabrielsroka_showCampuses";
}
)();
