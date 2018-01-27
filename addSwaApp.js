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
    var me;
    var div = $(createDiv("Add App"));
    div.html("<form><table><tr><td>Label<td><input class=label style='width: 300px'>" + 
        "<tr><td>Login URL<td><input class=loginUrl value='https://LOGIN.oktapreview.com' style='width: 300px'></table>" + 
        "<button type=submit>Add</button></form>");
    div.find("button").click(function () {
        $.get("/api/v1/users/me").then(function (user) {
            me = user;
            var app = {
                label: div.find("input.label").val(),
                settings: {
                    signOn: {
                        loginUrl: div.find("input.loginUrl").val()
                    }
                },
                signOnMode: "AUTO_LOGIN",
                visibility: {
                    autoSubmitToolbar: false
                }
            };
            div.html("Adding App...");
            // https://developer.okta.com/docs/api/resources/apps#add-custom-swa-application
            return postJson({
                url: "/api/v1/apps",
                data: app
            });
        }).then(function (app) {
            var appUser = {
                id: me.id,
                scope: "USER",
            };
            div.html("Assigning User...");
            // https://developer.okta.com/docs/api/resources/apps#assign-user-to-application-for-sso
            return postJson({
                url: "/api/v1/apps/" + app.id + "/users",
                data: appUser
            });
        }).then(function (appUser) {
            div.html("Done.");
        });
        return false; // Cancel form.
    });
    function postJson(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        return $.post(settings);
    }
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>" + title + " - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        return div.appendChild(document.createElement("div"));
    }
})();
