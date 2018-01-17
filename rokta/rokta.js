if (location.host.match(/-admin/)) {
    var results = createDiv("rokta");
    results.innerHTML = "<br>";

    if (location.pathname.match("/admin/user/")) {
        var a = results.appendChild(document.createElement("a"));
        a.innerHTML = "Show User<br>";
        a.onclick = function () {
            callAPI("/users/" + location.pathname.split("/")[5], enhanceUser);
            function enhanceUser() {
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
                var user = JSON.parse(this.responseText);
                var results = createDiv("User");
                results.innerHTML = "<br><span class='icon icon-24 group-logos-24 " + 
                    (user ? "logo-" + user.credentials.provider.type.toLowerCase() : "") + "'></span>" +
                    "<pre>" + (user ? toString(user) : "(not found)") + "</pre>";
            }
        };
    }
    var a = results.appendChild(document.createElement("a"));
    a.innerHTML = "Export Objects<br>";
    a.onclick = function () {
        var total;
        var objectType;
        var results;
        var logger;
        var groups;
        var csv;
        if (location.pathname == "/admin/users") {
            // see also Reports > Reports, Okta Password Health: https://ORG-admin.oktapreview.com/api/v1/users?format=csv
            getObjects("Users", "/users", "id,firstName,lastName,login,email,credentialType", function (user) {
                return user.id + ',"' + user.profile.firstName + '","' + user.profile.lastName + '","' + user.profile.login + '","' + user.profile.email + '",' + user.credentials.provider.type;
            });
        } else if (location.pathname == "/admin/groups") {
            getObjects("Groups", "/groups", "id,name,description,type", function (group) {
                return group.id + ',"' + group.profile.name + '","' + (group.profile.description || "") + '",' + group.type;
            });
        } else {
            var appid = getAppId();
            if (appid) {
                results = createDiv("Export");
                var a = results.appendChild(document.createElement("a"));
                a.innerHTML = "Export Groups";
                a.onclick = function () {
                    document.body.removeChild(results.parentNode);
                    getObjects("App Groups", "/apps/" + appid + "/groups", "id,licenses,roles", function (appgroup) {
                        callAPI("/groups/" + appgroup.id, function () {
                            var group = JSON.parse(this.responseText);
                            groups.push(group.profile.name + "," + (appgroup.profile.licenses ? appgroup.profile.licenses.join(";") : "") +
                                "," + (appgroup.profile.roles ? appgroup.profile.roles.join(";") : ""));
                            if (groups.length == total) {
                                console.log("name,licenses,roles");
                                for (var g = 0; g < groups.length; g++) {
                                    console.log("," + groups[g]);
                                }
                            }
                        });
                        return appgroup.id + "," + (appgroup.profile.licenses ? appgroup.profile.licenses.join(";") : "") +
                            "," + (appgroup.profile.roles ? appgroup.profile.roles.join(";") : "");
                    });
                };
                results.appendChild(document.createElement("br"));
                a = results.appendChild(document.createElement("a"));
                a.innerHTML = "Export Users";
                a.onclick = function () {
                    document.body.removeChild(results.parentNode);
                    getObjects("App Users", "/apps/" + appid + "/users", "userName", function (appuser) {
                        return appuser.credentials.userName;
                    });
                };
            } else {
                results = createDiv("Export");
                results.innerHTML = "<br>Error. Go to one of these:<br><br>" + 
                    "<a href='/admin/users'>Directory > People</a><br>" + 
                    "<a href='/admin/groups'>Directory > Groups</a><br>" +
                    "<a href='/admin/people/directories'>Directory > Directory Integrations</a> and click on a directory<br>" +
                    "<a href='/admin/apps/active'>Applications > Applications</a> and click on an app<br>";
            }
        }
        function getObjects(title, path, header, logCallback) {
            total = 0;
            objectType = title;
            results = createDiv(title);
            results.innerHTML = "Loading ...";
            logger = logCallback;
            csv = [header];
            groups = [];
            callAPI(path, exportObjects);
        }
        function exportObjects() {
            if (this.responseText) {
                var objects = JSON.parse(this.responseText);
                for (var i = 0; i < objects.length; i++) {
                    csv.push(logger(objects[i]));
                }
                total += objects.length;
                results.innerHTML = total + " " + objectType + "...";
                var links = getLinks(this.getResponseHeader("Link"));
                if (links.next) {
                    var path = links.next.replace(/.*api.v1/, ""); // links.next is an absolute URL; we need a relative URL.
                    callAPI(path, exportObjects);
                } else {
                    results.innerHTML = total + " " + objectType + ". Done.";
                    var a = results.appendChild(document.createElement("a"));
                    a.href = "data:application/csv;charset=utf-8," + encodeURIComponent(csv.join("\n"));
                    var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
                    a.download = "Export " + objectType + " " + date + ".csv";
                    a.click();
                }
            }
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
        function getAppId() {
            var path = location.pathname;
            var pathparts = path.split(/\//);
            if (path.match(/admin\/app/) && (pathparts.length == 6 || pathparts.length == 7)) {
                return pathparts[5];
            }
        }
    };
} else { // non-admin
    if (location.pathname == "/app/UserHome") {
        var results = createDiv("rokta");
        results.innerHTML = "<br>";

        var a = results.appendChild(document.createElement("a"));
        a.innerHTML = "Show SSO<br>";
        a.onclick = function () {
            var results;
            var label = "Show SSO";
            var labels = document.getElementsByClassName("app-button-name");
            if (labels.length > 0) { // Button labels on Okta homepage
                for (var i = 0; i < labels.length; i++) {
                    if (!labels[i].innerHTML.match(label)) {
                        var a = document.createElement("a");
                        a.onclick = function () {
                            getDiv();
                            getSSO(this.parentNode.previousSibling.previousSibling.href);
                        };
                        if (labels[i].clientHeight <= 17) {
                            a.innerHTML = "<br>" + label;
                        } else {
                            a.innerHTML = " - " + label;
                        }
                        labels[i].appendChild(a);
                    }
                }
            } else {
                getDiv();
                var form = results.appendChild(document.createElement("form"));
                var url = form.appendChild(document.createElement("input"));
                url.style.width = "700px";
                url.placeholder = "URL";
                url.focus();
                var input = form.appendChild(document.createElement("input"));
                input.type = "submit";
                input.value = label;
                form.onsubmit = function () {
                    getSSO(url.value);
                    return false;
                };
            }
            function getSSO(url) {
                results.innerHTML = "Loading . . .";
                var request = new XMLHttpRequest();
                request.open("GET", url);
                request.onload = showSSO;
                request.send();
            }
            function showSSO() {
                function unentity(s) {
                    return s.replace(/&#(x..?);/g, function (m, p1) {return String.fromCharCode("0" + p1)});
                }
                var highlight = "style='background-color: yellow'";
                var matches;
                if (matches = this.responseText.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/)) {
                    var assertion = unentity(matches[2]);
                    if (matches[1] == "SAMLResponse") assertion = atob(assertion);
                    console.log(assertion);
                    assertion = assertion.replace(/\n/g, "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;").
                        replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;").
                        replace(/((Address|Issuer|NameID|NameIdentifier|Name|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="|=&quot;))(.*?)(&lt;|"|&quot;)/g, "$1<span " + highlight + ">$4</span>$5");
                    var postTo = unentity(this.responseText.match(/<form id="appForm" action="(.*?)"/)[1]);
                    results.innerHTML = "<br>Post to: " + postTo + "<br><br><pre>" + indentXml(assertion, 4) + "</pre>";
                } else if (matches = this.responseText.match(/<form(?:.|\n)*<\/form>/)) {
                    var form = matches[0].replace(/ *</g, "&lt;").replace(/>/g, "&gt;").
                        replace(/value="(.*?)"/g, 'value="<span title="$1" ' + highlight + '>...</span>"');
                    results.innerHTML = "<br><pre>" + form + "</pre>";
                } else if (matches = this.responseText.match(/<div class="error-content">(?:.|\n)*?<\/div>/)) {
                    results.innerHTML = "<br><pre>" + matches[0] + "</pre>";
                } else {
                    results.innerHTML = "<br>Is this a SWA app, plugin or bookmark?";
                }
            }
            function getDiv() {
                results = createDiv("SSO");
            }
            function indentXml(xml, size) {
                var lines = xml.split("\n");
                var level = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var end = line.match("&lt;/");
                    var empty = line.match("/&gt;") || line.match(/&gt;.*&gt;/);
                    if (end && !empty) level--;
                    lines[i] = " ".repeat(size * level) + line;
                    if (!end && !empty) level++;
                }
                return lines.join("\n");
            }
            if (!String.prototype.repeat) String.prototype.repeat = function (n) {
                return "                                                ".substring(0, n);
            };
        };
    }
}
    
function callAPI(path, onload) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/v1" + path);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = onload;
//    request.onprogress = function (event) {
//        results.innerHTML = event.loaded + " bytes loaded.";
//    };
    request.send();
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
