/* 
Update the certificate for a SAML app. See:
https://developer.okta.com/docs/guides/updating-saml-cert

Setup:
Copy this code to the browser console or, if using Chrome, to a Snippet. For example:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "updateSAMLCert.js".
4. Copy/paste the code from https://gabrielsroka.github.io/updateSAMLCert.js
5. Save (Ctrl+S, Windows).

Usage:
1. In Okta Admin, go to Applications > Applications and click on an app.
2. Press F12 (Windows) to open DevTools.
3. Run the code. If using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
*/

(async function () {
    var appId = getAppId();
    if (!appId) {
        alert("Error. Go to Applications > Applications and click on an app.");
        return;
    }

    while (true) {
        var validityYears = prompt("Enter years of validity. This must be between 2 and 10.", 10);
        if (validityYears) {
            if (validityYears >= 2 && validityYears <= 10) {
                break;
            } else {
                alert("Invalid value.");
            }
        } else {
            return;
        }
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
