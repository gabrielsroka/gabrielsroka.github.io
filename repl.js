/* 
This bookmarklet allows you to call the Okta API using the browser console as a command line. See Examples below.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/repl.js";})();

Usage:
1. Login to Okta Admin.
2. Open the dev console (F12).
3. Click the bookmark from your toolbar.
4. Type in commands. API commands are asynchronous. When they are done, you'll see "Ready". See Examples below.

Examples:
// Get me. Result is in _, __ and _y -- each one in a different format.
u("me")
user = _
__
_y

// Get group.
g("?q=powershell")
group = _

// Add user to group.
g(group.id + "/users/" + user.id, "PUT")

// Create user with password using XSRF.
user = {profile: {login: "a@a.com", email: "a@a.com", firstName: "first", lastName: "a1"}, credentials: {password: {value: "Password123"}}}
u("", "POST", user, true)

// Create user (needs apikey).
user = {profile: {login: "a@a.com", email: "a@a.com", firstName: "first", lastName: "a1"}}
u("", "POST", user)

// Get users.
u()
_.length
// Show users in a table.
t("id,profile.email,profile.firstName,profile.lastName,profile.login,credentials.provider.type,created")
// Show users in a table, use a 'where' clause.
t("id,profile.email,profile.firstName,profile.lastName,profile.login","profile.firstName=Test")

// Get groups.
g()
t("profile.name,profile.description,type")

// Get events.
o("/events?startDate=2016-01-23T00:00:00.0-08:00&limit=10")
t("eventId,actors.0.displayName,published,action.message")
*/

function o(path, method, body, xsrf) {
    _ = __ = _y = "Loading ...";
    var request = new XMLHttpRequest();
    request.open(method ? method : "GET", "/api/v1" + path);
    if (window.apikey) request.setRequestHeader("Authorization", "SSWS " + apikey);
    if (xsrf) request.setRequestHeader("X-Okta-XsrfToken", document.getElementById("_xsrfToken").innerText);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = function () {
        if (request.responseText) {
            _ = JSON.parse(request.responseText);
            if (_.length == 1) _ = _[0];
            __ = JSON.stringify(_, null, 2);
            _y = toYAML(_); // YAML-ish
        } else {
            _ = __ = _y = "";
        }
        console.log("Ready.")
    };
    request.send(body ? JSON.stringify(body) : null);
    return _;
}
function u(path, method, body, xsrf) {
    return o("/users/" + (path ? path : ""), method, body, xsrf);
}
function g(path, method, body, xsrf) {
    return o("/groups/" + (path ? path : ""), method, body, xsrf);
}
function t(fields, where) {
    if (fields) {
        fields = fields.split(",");
        var rows = [];
        for (var i in _) {
            var o = {};
            for (var f in fields) {
                o[fields[f]] = dot(_[i], fields[f]);
            }
            if (where) {
                var whereFields = where.split("="), whereField = whereFields[0], whereValue = whereFields[1];
                if (o[whereField] == whereValue) rows.push(o);
            } else {
                rows.push(o);
            }
        }
    } else {
        rows = _;
    }
    console.table(rows);
}
function dot(o, dots) {
    var ps = dots.split(".");
    for (var p in ps) {
        o = o[ps[p]];
        if (o == null) break;
    }
    return o;
}
function toYAML(o, i) {
    var a = [], v, i = i || "";
    for (var p in o) {
        v = o[p];
        if (v === null) v = "null";
        else if (typeof v == "string") v = v.replace(/(["\\])/g, "\\$1"); // Escape " and \
        else if (v instanceof Array) v = "\n" + toYAML(v, i + "  ");
        else if (typeof v == "object") v = "\n" + toYAML(v, i + "  ");
        if (o instanceof Array) p = "-"; else p += ":";
        a.push(i + p + " " + v);
    }
    return a.join("\n");
}
