/* 
This bookmarklet exports app users.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/exportAppUsers.js";})();

Usage:
1. In Okta Admin, go to Applications > Applications.
2. Click on an app.
3. Open the dev console (F12).
4. Click the bookmark from your toolbar.
5. When the export is done, the users are in the console. Save the results to a CSV file.
*/

(function () {
    var appid = getAppId();
    if (appid) {
        console.clear();
        var total = 0;
        var results = createDiv("App Users");
        callAPI("/apps/" + appid + "/users", showAppUsers);
    } else {
        alert("Error. Go to Applications > Applications and click on an app.");
    }
    function showAppUsers() {
        if (this.responseText) {
            var appusers = JSON.parse(this.responseText);
            for (var i = 0; i < appusers.length; i++) {
                console.log(appusers[i].credentials.userName);
            }
            total += appusers.length;
            results.innerHTML = total + " app users.";
            var links = getLinks(this.getResponseHeader("Link"));
            if (links.next) {
                var path = links.next.replace(/.*api.v1/, ""); // links.next is an absolute URL; we need a relative URL.
                callAPI(path, showAppUsers);
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
        if (path.match(/admin\/app/) && pathparts.length == 7) {
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
