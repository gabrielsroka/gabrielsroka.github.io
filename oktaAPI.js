/* 
set apikey in the bookmarklet VVVVVV
javascript:(function(){window.apikey="";var script=document.body.appendChild(document.createElement("script"));
script.src="https://gabrielsroka.github.io/oktaAPI.js";script.onload=function(){document.body.removeChild(this);};})();
*/
(function () {
    var div, results, total = 0;
    if (location.pathname == "/report/system_log") {
        div = createDiv("Events");
        var status = div.appendChild(document.createElement("div"));
        status.innerHTML = "Loading . . .";
        results = div.appendChild(document.createElement("textarea"));
        results.style.width = document.body.clientWidth + "px";
        results.style.height = "500px";
        callAPI("/events?limit=250", showEvents);
    } else if (location.pathname == "/admin/users") {
        callAPI("/users", enhanceUsers);
    } else {
        div = createDiv("People");
        results = div.appendChild(document.createElement("div"));
        results.innerHTML = "Loading . . .";
        callAPI("/users", showUsers);
    }
    function enhanceUsers() {
        var users = JSON.parse(this.responseText);
        var userById = {};
        for (var u = 0; u < users.length; u++) {
            var user = users[u];
            userById[user.id] = user;
        }
        var table = document.getElementsByClassName("data-list-table")[0];
        if (table.rows[0].cells[0].innerHTML != "Source") {
            table.rows[0].insertBefore(document.createElement("th"), table.rows[0].cells[0]).innerHTML = "Source";
        }
        for (var r = 1; r < table.rows.length - table.tFoot.rows.length; r++) {
            var href = table.rows[r].cells[0].firstChild.nextSibling.href;
            var userid = href.substr(href.lastIndexOf("/") + 1);
            user = userById[userid];
            var cell = table.rows[r].insertCell(0);
            cell.innerHTML = "<span class='icon icon-24 group-logos-24 " + 
                (user ? user.credentials.provider.type.toLowerCase() : "") + "'>" +
                "<pre style='display: none; position: absolute; background-color: #ffffca; z-index: 1000; padding: 8px'>" + 
                (user ? toString(user) : "(not found)") + "</pre></span>";
            cell.onmouseover = function () {this.firstChild.firstChild.style.display = "inline";};
            cell.onmouseout  = function () {this.firstChild.firstChild.style.display = "none";};
        }
    }
    function showUsers() {
        var users = JSON.parse(this.responseText);
        var rows = [];
        for (var u = 0; u < users.length; u++) {
            var user = users[u];
            var name = user.profile.firstName + " " + user.profile.lastName;
            rows.push("<tr sortby='" + name + "'><td><span class='icon icon-24 group-logos-24 " + 
                user.credentials.provider.type.toLowerCase() + "'></span>" + 
                "<td>" + name.link("/admin/user/profile/view/" + user.id) + "<td>" + user.profile.login + 
                "<td>" + user.profile.email + 
                "<td onmouseover=this.nextSibling.style.display='inline' onmouseout=this.nextSibling.style.display='none'>..." +
                "<td style='display: none; position: absolute; background-color: #ffffca'>" + 
                "<pre>" + toString(user) + "</pre>");
        }
        results.innerHTML = "<br>Activated " + users.length + 
            "<table class='data-list-table'><tr><th>Source<th>Person<th>Username<th>Email<th>..." + rows.sort().join("") + 
            "</table>";
    }
    function showEvents() {
        var events = JSON.parse(this.responseText); // [].length: 1-2 actors, 0-2 targets, 0-2 categories
        var delim = "\t";
        var lines = [];
        for (var e = 0; e < events.length; e++) {
            var event = events[e];
            var person = event.actors[0].displayName;
            var login = event.actors[0].login;
            var ipAddress = event.actors[1] ? event.actors[1].ipAddress : event.actors[0].ipAddress;
            var target = event.targets[1] || event.targets[0];
            target = target ? target.displayName : "";
            if (!person) {
                person = target;
                target = "";
            }
            if (target == person) target = "";
            lines.push([event.eventId.substr(0, 25), event.published, person, login, target, '"' + 
                event.action.message.replace(/"/g, '""') + '"', ipAddress].join(delim));
        }
        if (results.value == "") {
            results.value = ["Event Id", "Date", "Person", "Login", "Application", "Message", "Client IP\n"].join(delim);
        } else if (lines.length > 0) {
            results.value += "\n";
        }
        results.value += lines.join("\n");
        total += lines.length;
        status.innerHTML = "Loading " + total + " . . .";
        var links = parseLinks(this.getResponseHeader("Link"));
        if (links.next) {
            callAPI(links.next.replace(/.*api.v1/g, ""), showEvents);
        } else {
            status.innerHTML = "Loaded " + total;
        }
    }
    function callAPI(path, onload) {
        var request = new XMLHttpRequest();
        request.open("get", "/api/v1" + path);
        request.setRequestHeader("Authorization", "SSWS " + (window.apikey ? apikey : apikey = prompt("Enter API key")));
        request.onload = onload;
        request.send();
    }
    function parseLinks(links) {
        links = links.split(", ");
        var o = {};
        for (var i = 0; i < links.length; i++) {
            var parts = links[i].split("; ");
            o[parts[1].replace(/rel=|"/g, "")] = parts[0].replace(/[<>]/g, "");
        }
        return o;
    }
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>&nbsp;" + title + " - X</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        return div;
    }
    function toString(o, i) {
        var a = [], v, i = i || "";
        for (var p in o) {
            if (o[p] === null) v = "null";
            else if (typeof o[p] == "string") v = '"' + o[p].replace(/(["\\])/g, "\\$1") + '"'; // Escape " and \
            else if (o[p] instanceof Array) v = "[" + o[p].toString() + "]";
            else if (typeof o[p] == "object") v = "{\n" + toString(o[p], i + "\t") + i + "}";
            else v = o[p];
            a.push(i + p + " = " + v);
        }
        return a.join("\n") + "\n";
    }
}
)();
