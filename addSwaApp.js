// Add a Custom SWA app and assign it to me.

(function () {
    var label = "aaa Test";
    var loginUrl = "https://aatest.oktapreview.com";

    var me;
    $.get("/api/v1/users/me").then(function (user) {
        me = user;
        var app = {
            label: label,
            settings: {
                signOn: {
                  loginUrl: loginUrl
                }
            },
            signOnMode: "AUTO_LOGIN",
            visibility: {
                autoSubmitToolbar: false
            }
        };
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
        // https://developer.okta.com/docs/api/resources/apps#assign-user-to-application-for-sso
        return postJson({
            url: "/api/v1/apps/" + app.id + "/users",
            data: appUser
        });
    }).then(function () {
        alert("done");
    });
    function postJson(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        return $.post(settings);
    }
})();
