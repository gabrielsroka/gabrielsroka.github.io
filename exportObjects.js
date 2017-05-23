(function () {
    var total;
    var objectType;
    var results;
    var logger;
    var groups;
    if (location.pathname == "/admin/users") {
        getObjects("Users", "/users", "id,firstName,lastName,login,email", function (user) {
            return user.id + ',"' + user.profile.firstName + '","' + user.profile.lastName + '",' + user.profile.email;
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
                getObjects("App Groups", "/apps/" + appid + "/groups?limit=50", "id,licenses", function (appgroup) {
                    callAPI("/groups/" + appgroup.id, function () {
                        var group = JSON.parse(this.responseText);
                        groups.push(group.profile.name + "," + (appgroup.profile.licenses ? appgroup.profile.licenses.join(";") : ""))+
                            "," + (appgroup.profile.roles ? appgroup.profile.roles.join(";") : ""));
                        if (groups.length == total) {
                            console.log("groups");
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
        logger = logCallback;
        console.clear();
        console.log("ignore," + header);
        groups = [];
        callAPI(path, showObjects);
    }
    function showObjects() {
        if (this.responseText) {
            var objects = JSON.parse(this.responseText);
            for (var i = 0; i < objects.length; i++) {
                // Start with ',' because Chrome adds extra info at the beginning of each line.
                console.log(',' + logger(objects[i]));
            }
            total += objects.length;
            results.innerHTML = total + " " + objectType + ".";
            var links = getLinks(this.getResponseHeader("Link"));
            if (links.next) {
                var path = links.next.replace(/.*api.v1/, ""); // links.next is an absolute URL; we need a relative URL.
                callAPI(path, showObjects);
            } else {
                results.innerHTML += " Done -- check the console for results.";
            }
        }
    }
    function callAPI(path, onload) {
        var request = new XMLHttpRequest();
        request.open("GET", "/api/v1" + path);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.onload = onload;
        request.send();
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
