// Drag this to the bookmarks toolbar:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/exportAppUsers.js";})();

(function () {
	console.clear();
	var total = 0;
	var results = createDiv("App Users");
	var path = location.pathname;
	var pathparts = path.split(/\//);
	if (!(path.match(/admin\/app/) && pathparts.length == 7)) {
		alert("Error. Click on an app.");
		return;
	}
	var appid = pathparts[5];
	callAPI("/apps/" + appid + "/users?limit=20", onload);
	return "Loading ...";
	function callAPI(path, onload) {
		var request = new XMLHttpRequest();
		request.open("GET", "/api/v1" + path);
		request.setRequestHeader("Content-Type", "application/json");
		request.setRequestHeader("Accept", "application/json");
		request.onload = onload;
		request.send();
	}
	function onload() {
		if (this.responseText) {
			var users = JSON.parse(this.responseText);
			for (var i = 0; i < users.length; i++) {
				console.log(users[i].credentials.userName);
			}
			total += users.length;
			results.innerHTML = total + " users.";
			var links = getLinks(this.getResponseHeader("Link"));
			if (links.next) {
				callAPI(links.next.replace(/.*api.v1/, ""), onload);
			} else {
				results.innerHTML = total + " users. Done.";
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
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>" + title + " - X</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        return div.appendChild(document.createElement("div"));
    }
})();
