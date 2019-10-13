/* 
Add a Custom SWA app and assign it to me.

Setup:
Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/addSwaApp.js";})();

Usage:
1. Login to Okta Admin.
2. Click the bookmark from your toolbar.
*/

(function () {
    var popup = createPopup("Add SWA App");
    var form = $("<form><table><tr><td>Label<td><input class=label style='width: 300px'>" + 
        "<tr><td>Login URL<td><input class=loginUrl value='https://LOGIN.oktapreview.com' style='width: 300px'></table>" + 
        "<button type=submit>Add</button></form>").appendTo(popup);
    form.submit(async (event) => {
        event.preventDefault();
        popup.html("Getting user...");
        var me = await $.get("/api/v1/users/me");
        var app = {
            label: form.find("input.label").val(),
            settings: {
                signOn: {
                    loginUrl: form.find("input.loginUrl").val()
                }
            },
            signOnMode: "AUTO_LOGIN",
            visibility: {
                autoSubmitToolbar: false
            },
            credentials: {
                revealPassword: true
            }
        };
        popup.html("Adding app...");
        // https://developer.okta.com/docs/reference/api/apps/#add-custom-swa-application
        app = await postJson({
            url: "/api/v1/apps",
            data: app
        });
        var appUser = {
            id: me.id,
            scope: "USER"
        };
        popup.html("Assigning user to app...");
        // https://developer.okta.com/docs/reference/api/apps/#assign-user-to-application-for-sso
        await postJson({
            url: "/api/v1/apps/" + app.id + "/users",
            data: appUser
        });
        popup.html(`Added app <a href='/admin/app/${app.name}/instance/${app.id}/'>${app.label}</a>.`);
    });
    function postJson(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        return $.post(settings);
    }
    function createPopup(title) {
        var popup = $(`<div style='position: absolute; z-index: 1000; left: 4px; top: 4px; background-color: white; padding: 8px; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io' target='_blank' rel='noopener'>&nbsp;?&nbsp;</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer'>&nbsp;X&nbsp;</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
