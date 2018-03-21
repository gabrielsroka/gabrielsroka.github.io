(function () {
    var total;
    var objectType;
    var results;
    var logger;
    var groups;
    var lines;
    var query = "";
    if (location.pathname == "/admin/users") {
        // see also Reports > Reports, Okta Password Health: https://ORG.oktapreview.com/api/v1/users?format=csv
        //query = "?search=profile.secretPasscode pr";
        getObjects("Users", "/users" + query, "id,firstName,lastName,login,email,credentialType", function (user) {
            return user.id + ',"' + user.profile.firstName + '","' + user.profile.lastName + '","' + user.profile.login + '","' + user.profile.email + '",' + user.credentials.provider.type;
        });
    } else if (location.pathname == "/admin/groups") {
        getObjects("Groups", "/groups", "id,name,description,type", function (group) {
            return group.id + ',"' + group.profile.name + '","' + (group.profile.description || "") + '",' + group.type;
        });
    } else if (location.pathname == "/admin/apps/active") {
        getObjects("Apps", "/apps", "id,label,name", function (app) {
            return app.id + ',"' + app.label + '","' + app.name + '"';
        });
    } else if (location.pathname == "/report/system_log_2") {
        query = "?since=2018-02-01T23%3A17%3A07Z&until=2018-02-03T05%3A24%3A18Z&limit=20&" + 
            "filter=target.id+eq+%220oaf65hlg1DbLxkhp0x7%22+and+target.type+eq+%22AppInstance%22+and+outcome.result+eq+%22FAILURE%22+and+legacyEventType+eq+%22app.rich_client.multiple_accounts_found%22";
        getObjects("Logs", "/logs" + query, "userName", function (event) {
            return event.debugContext.debugData.userName;
        });
    } else {
        var appid = getAppId();
        if (appid) {
            results = createDiv("Export");
            var a = results.appendChild(document.createElement("a"));
            a.innerHTML = "Export App Groups";
            a.onclick = function () {
                document.body.removeChild(results.parentNode);
                getObjects("App Groups", "/apps/" + appid + "/groups", "id,licenses,roles", function (appgroup) {
                    callAPI("/groups/" + appgroup.id, function () {
                        var group = JSON.parse(this.responseText);
                        groups.push(group.profile.name + "," + (appgroup.profile.licenses ? appgroup.profile.licenses.join(";") : "") + "," + 
                            (appgroup.profile.roles ? appgroup.profile.roles.join(";") : ""));
                        if (groups.length == total) {
                            console.log("name,licenses,roles");
                            for (var g = 0; g < groups.length; g++) {
                                console.log("," + groups[g]);
                            }
                        }
                    });
                    return appgroup.id + "," + (appgroup.profile.licenses ? appgroup.profile.licenses.join(";") : "") + "," + 
                        (appgroup.profile.roles ? appgroup.profile.roles.join(";") : "");
                });
            };
            results.appendChild(document.createElement("br"));
            a = results.appendChild(document.createElement("a"));
            a.innerHTML = "Export App Users";
            a.onclick = function () {
                document.body.removeChild(results.parentNode);
                getObjects("App Users", "/apps/" + appid + "/users", "id,userName,scope", function (appuser) {
                    return appuser.id + "," + (appuser.credentials ? appuser.credentials.userName : "") + "," + appuser.scope;
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
        lines = [header];
        groups = [];
        callAPI(path, exportObjects);
    }
    function exportObjects() {
        if (this.responseText) {
            var objects = JSON.parse(this.responseText);
            for (var i = 0; i < objects.length; i++) {
                var object = logger(objects[i]);
                if (object) lines.push(object);
            }
            total += objects.length;
            results.innerHTML = total + " " + objectType + "...";
            var links = getLinks(this.getResponseHeader("Link"));
            if (links && links.next) {
                var path = links.next.replace(/.*api.v1/, ""); // links.next is an absolute URL; we need a relative URL.
                if (this.getResponseHeader("X-Rate-Limit-Remaining") && this.getResponseHeader("X-Rate-Limit-Remaining") < 10) {
                    var interval = setInterval(() => {
                        results.innerHTML += "<br>Sleeping...";
                        if ((new Date()).getTime() / 1000 > this.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(interval);
                            callAPI(path, exportObjects);
                        }
                    }, 1000);
                } else {
                    callAPI(path, exportObjects);
                }
            } else {
                results.innerHTML = total + " " + objectType + ". Done.";
                var a = results.appendChild(document.createElement("a"));
                a.href = URL.createObjectURL(new Blob([lines.join("\n")], {type: 'text/csv'}));
                // a.href = "data:application/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
                var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
                a.download = "Export " + objectType + " " + date + ".csv";
                a.click();
            }
        }
    }
    function callAPI(path, onload) {
        var request = new XMLHttpRequest();
        request.open("GET", "/api/v1" + path);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.onload = onload;
        request.onprogress = function (event) {
            results.innerHTML = event.loaded + " bytes loaded.";
        };
        request.send();
    }
    function getLinks(headers) {
        if (headers) {
            headers = headers.split(", ");
            var links = {};
            for (var i = 0; i < headers.length; i++) {
                var matches = headers[i].match(/<(.*)>; rel="(.*)"/);
                links[matches[2]] = matches[1];
            }
            return links;
        }
    }
    function getAppId() {
        var path = location.pathname;
        var pathparts = path.split("/");
        if (path.match(/admin\/app/) && (pathparts.length == 6 || pathparts.length == 7)) {
            return pathparts[5];
        }
    }
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>" + title + " - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a><br><br>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        return div.appendChild(document.createElement("div"));
    }
})();
