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

    var appid = getAppId();
    if (!appid) {
        alert("Error. Go to Applications > Applications and click on an app.");
        return;
    }
    var updatedApp;
    $.get("/api/v1/apps/" + appid).then(function (app) {
        updatedApp = {
            name: app.name,
            label: app.label,
            signOnMode: app.signOnMode
        };
        return $.post("/api/v1/apps/" + appid + "/credentials/keys/generate?validityYears=" + validityYears);
    }).then(function (key) {
        updatedApp.credentials = {
            signing: {
                kid: key.kid
            }
        };
        return put("/api/v1/apps/" + appid, updatedApp);
    }).then(function () {
        location = "/admin/org/security/" + appid + "/cert";
    }).fail(function (jqXHR) {
        var causes = jqXHR.responseJSON.errorCauses;
        var errors = "";
        for (var c = 0; c < causes.length; c++) {
            errors += causes[c].errorSummary + "\n";
        }
        alert("Error:\n" + errors);
    });
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
