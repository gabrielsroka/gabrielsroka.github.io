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

/*
// get all users
u()
_.length

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
*/
