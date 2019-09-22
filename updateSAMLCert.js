/* 
This bookmarklet updates the certificate for SAML apps. see:
https://developer.okta.com/docs/guides/updating-saml-cert

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/updateSAMLCert.js"})()

Usage:
1. In Okta Admin, go to Applications > Applications and click on an app.
2. Click the bookmark from your toolbar.
*/

(async function () {
    var validityYears = 10; // This must be between 2 and 10.

    var appId = getAppId();
    if (!appId) {
        alert("Error. Go to Applications > Applications and click on an app.");
        return;
    }
    try {
        var app = await $.get("/api/v1/apps/" + appId);
        var key = await $.post("/api/v1/apps/" + appId + "/credentials/keys/generate?validityYears=" + validityYears);
        var updatedApp = {
            name: app.name,
            label: app.label,
            signOnMode: app.signOnMode,
            credentials: {
                signing: {
                    kid: key.kid
                }
            }
        };
        await put("/api/v1/apps/" + appId, updatedApp);
        location = "/admin/org/security/" + appId + "/cert";
    } catch (jqXHR) {
        alert("Error: " + jqXHR.responseJSON.errorCauses.map(e => e.errorSummary).join("\n"));
    }
    function put(url, body) {
        return $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(body),
            contentType: "application/json"
        });
    }
    function getAppId() {
        if (location.pathname.match("/admin/app/")) {
            return location.pathname.split("/")[5];
        }
    }
})();
