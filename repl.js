/* 
javascript:(function(){var script=document.body.appendChild(document.createElement("script"));
script.src="https://gabrielsroka.github.io/repl.js";script.onload=function(){document.body.removeChild(this);};})();
*/

function o(path, method, body) {
    _ = __ = _y = "Loading ...";
    var request = new XMLHttpRequest();
    request.open(method ? method : "GET", "/api/v1" + path);
    if (window.apikey) request.setRequestHeader("Authorization", "SSWS " + apikey);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = function () {
        if (request.responseText) {
            _ = JSON.parse(request.responseText);
            if (_.length == 1) _ = _[0];
            __ = JSON.stringify(_, null, 2);
            _y = __.replace(/([",{}]|\.000)/g, "").replace(/^ *\n/gm, ""); // yaml-ish
        } else {
            _ = __ = _y = "";
        }
        console.log("Ready.")
    };
    request.send(body ? JSON.stringify(body) : null);
    return _;
}
function u(path, method, body) {
    return o("/users/" + (path ? path : ""), method, body);
}
function g(path, method, body) {
    return o("/groups/" + (path ? path : ""), method, body);
}
function t(fields) {
    if (fields) {
        fields = fields.split(",");
        var r = [];
        for (var i in _) {
            var vs = {};
            for (f in fields) {
                vs[fields[f]] = dot(_[i], fields[f]);
            }
            r.push(vs);
        }
    } else {
        r = _;
    }
   console.table(r);
}
function dot(o, dots) {
    var ps = dots.split(".");
    for (var p in ps) {
        o = o[ps[p]];
        if (o == null) break;
    }
    return o;
}

/*
// get me
u("me")
me=_
__

// get group
g("?q=powershell")
group=_

// add user to group
g(group.id + "/users/" + me.id, "PUT")

// create user
u("", "POST", {profile: {login: "a@a.com", email: "a@a.com", firstName: "first", lastName: "a1"}})

// get users
u()
_.length
t("id,profile.email,profile.firstName,profile.lastName,profile.login,credentials.provider.type,created")

// get groups
g()
t("profile.name,profile.description,type")

// get events
o("/events?startDate=2016-01-23T00:00:00.0-08:00")
t("eventId,actors.0.displayName,published,action.message")
*/
