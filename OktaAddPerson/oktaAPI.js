// User functions - http://developer.okta.com/docs/api/resources/users.html

/* args: 
        user - {profile: {firstName: "", lastName: "", login: "", email: ""}}
        activate
        provider
        onload
*/
function newUser(args) {
    if (args.activate == undefined) args.activate = true;
    if (args.provider == undefined) args.provider = false;
    callAPI("POST", "/users?" + argsToString(args, "activate,provider"), args.onload, args.user);
}

function getUser(id, onload) {
    callAPI("GET", "/users/" + id, onload);
}

/* args: 
        q - optional
        filter - optional
        limit - optional
        search - optional
        url - required if all optional args are omitted
        onload - required
*/
function getUsers(args) {
    args.limit = args.limit || 200;
    args.url = args.url || ("/users?" + argsToString(args, "q,filter,limit,search"));
    callAPI("GET", args.url, args.onload);
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

function getLinks(headers) {
    headers = headers.split(", ");
    var links = {};
    for (var i = 0; i < headers.length; i++) {
        var matches = headers[i].match(/<(.*)>; rel="(.*)"/);
        links[matches[2]] = matches[1];
    }
    return links;
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

function argsToString(args, names) {
    var a = [];
    names = names.split(",");
    for (var n = 0; n < names.length; n++) {
        var v = args[names[n]];
        if (v != undefined) a.push(names[n] + "=" + v);
    }
    return a.join("&");
}
