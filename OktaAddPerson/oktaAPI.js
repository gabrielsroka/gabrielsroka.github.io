// User functions - http://developer.okta.com/docs/api/resources/users.html

/*
    onload - callback
    user - {profile: {firstName: "", lastName: "", login: "", email: ""}}
    query - eg: activate, provider, ...
*/
function newUser(onload, user, query) {
    callAPI("POST", "/users?" + queryToString(query), onload, user);
}

function getUser(onload, id) {
    callAPI("GET", "/users/" + id, onload);
}

/*
    onload - callback
    query - eg: q, filter, limit, search, ...
*/
function getUsers(onload, query) {
    callAPI("GET", "/users?" + queryToString(query), onload);
}

// Core functions

function callAPI(method, url, onload, body) {
    var request = new XMLHttpRequest();
    if (!url.match(/^http/)) url = baseurl + "/api/v1" + url;
    request.open(method, url);
    request.setRequestHeader("Authorization", "SSWS " + apitoken);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = onload;
    request.send(body ? JSON.stringify(body) : null);
}

/* Example:
    getUsers(showUsers, {limit: 10});
    function showUsers() {
        var links = getLinks(this.getResponseHeader("Link"));
        if (links.next) {
            getNextPage(showUsers, links.next);
        }
    }
*/
function getLinks(header) {
    var headers = header.split(", ");
    var links = {};
    for (var i = 0; i < headers.length; i++) {
        var matches = headers[i].match(/<(.*)>; rel="(.*)"/);
        links[matches[2]] = matches[1];
    }
    return links;
}

function getNextPage(onload, url) {
    callAPI("GET", url, onload);
}

function toString(o, i) {
    var a = [], v, i = i || "";
    for (var p in o) {
        if (o[p] === null) v = "null";
        else if (typeof o[p] == "string") v = '"' + o[p].replace(/(["\\])/g, "\\$1") + '"'; // Escape " and \ 
        else if (o[p] instanceof Array) v = "[" + toString(o[p], i) + "]";
        else if (typeof o[p] == "object") v = "{\n" + toString(o[p], i + "\t") + i + "}";
        else v = o[p];
        a.push(i + p + " = " + v);
    }
    return a.join("\n") + "\n";
}

function queryToString(query) {
    var a = [];
    for (var n in query) {
        var v = query[n];
        if (v != undefined) a.push(n + "=" + v);
    }
    return a.join("&");
}
