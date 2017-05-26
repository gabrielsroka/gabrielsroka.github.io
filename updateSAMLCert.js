/* 
This bookmarklet updates the certificate for SAML apps. see:
http://developer.okta.com/docs/how-to/updating_saml_cert.html

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/updateSAMLCert.js";})();

Usage:
1. In Okta Admin, go to Applications > Applications and click on an app.
2. Click the bookmark from your toolbar.
*/

(function () {
    var validityYears = 10; // This must be between 2 and 10.
    
    function callAPI(method, path, onload, body) {
        var request = new XMLHttpRequest();
        request.open(method, path);
        request.setRequestHeader("X-Okta-XsrfToken", document.getElementById("_xsrfToken").innerText);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.onload = onload;
        request.send(body ? JSON.stringify(body) : null);
    }
    function showError(responseText) {
        var causes = JSON.parse(responseText).errorCauses;
        var errors = [];
        for (var c = 0; c < causes.length; c++) {
            errors.push(causes[c].errorSummary);
        }
        return errors.join("\n");
    }
    function getAppId() {
        var path = location.pathname;
        var pathparts = path.split(/\//);
        if (path.match(/admin\/app/) && pathparts.length == 7) {
            return pathparts[5];
        }
    }
    var OK = 200, created = 201;

    var appid = getAppId();
    if (!appid) {
        alert("Error. Go to Applications > Applications and click on an app.");
        return;
    }
    callAPI("GET", "/api/v1/apps/" + appid, function () {
        if (this.status != OK) {
            alert("get app error: " + showError(this.responseText));
            return;
        }
        var app = JSON.parse(this.responseText);
        callAPI("POST", "/api/v1/apps/" + appid + "/credentials/keys/generate?validityYears=" + validityYears, function () {
            if (this.status != created) {
                alert("create key error: " + showError(this.responseText));
                return;
            }
            var key = JSON.parse(this.responseText);
            var body = {
                name: app.name, 
                label: app.label, 
                signOnMode: app.signOnMode, 
                credentials: {
                    signing: {
                        kid: key.kid
                    }
                }
            };
            callAPI("PUT", "/api/v1/apps/" + appid, function () {
                if (this.status != OK) {
                    alert("update app error: " + showError(this.responseText));
                    return;
                }
                alert("Success! See console for details.");
                console.log("Download new cert from Okta. Click on this link.");
                console.log(location.origin + "/admin/org/security/" + appid + "/cert");
            }, body);
        });
    });
})();
