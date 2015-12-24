/* 
set apikey in the bookmarklet VVVVVV
javascript:(function(){window.apikey="";var script=document.body.appendChild(document.createElement("script"));
script.src="https://gabrielsroka.github.io/repl.js";script.onload=function(){document.body.removeChild(this);};})();
*/

function o(path, method, body) {
    _ = __ = "Loading ...";
    var request = new XMLHttpRequest();
    request.open(method ? method : "GET", "/api/v1" + path);
    request.setRequestHeader("Authorization", "SSWS " + (window.apikey ? apikey : apikey = prompt("Enter API key")));
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = function () {
        if (request.responseText) {
            _ = JSON.parse(request.responseText);
            if (_.length == 1) _ = _[0];
            __ = JSON.stringify(_, null, 2);
        } else {
            _ = __ = "";
        }
    };
    request.send(body ? JSON.stringify(body) : null);
}
function u(path, method, body) {
    o("/users/" + (path ? path : ""), method, body);
}
function g(path, method, body) {
    o("/groups/" + (path ? path : ""), method, body);
}
function t(fields) {
    fields = fields.split(",");
    var r = [];
    for (var i in _) {
        var vs = {};
        for (f in fields) {
            var o = dot(_[i], fields[f]);
            vs[fields[f]] = o;
        }
        r.push(vs);
    }
   console.table(r);
}
function dot(o, dots) {
    var ps = dots.split(".");
    for (var p in ps) {
        o = o[ps[p]] || "";
    }
    return o;
}

/*
// get all users
u()
_.length
t("id,profile.email,profile.firstName,profile.lastName,profile.login,credentials.provider.type,created")

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
u("", "POST", {profile: {login: "a@a.com", email: "a@a.com", firstName: "first", lastName: "a100"}})

// get events
o("/events?startDate=2015-12-23T00:00:00.0Z")
*/
