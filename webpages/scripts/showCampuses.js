/// <reference path="campuses.js" />
/// <reference path="js.js" />
/// <reference path="dialog.js" />
/// <reference path="table.js" />
/// <reference path="Request.js" />

// Copyright 2008-2011 Gabriel Sroka

// 1. Remote URLs work in:
//    o  IE with "Access data sources across domains" Enabled in Custom Level/Miscellaneous
//    o  FF 3.5/Chrome using cross-domain XMLHttpRequest if the requested server sends the Access-Control-Allow-Origin HTTP header
// 2. Go to http://www.incommonfederation.org/participants/
// 3. Run bookmarklet or use Greasemonkey script (see showCampuses.user.js).

// This anonymous function is called when Greasemonkey/bookmarklet loads this file.
(function (path, scripts, allScriptsLoaded) {
    var scriptsLoaded = 0;
    function scriptLoaded() {
        scriptsLoaded++;
        if (scriptsLoaded == scripts.length) allScriptsLoaded();
    }
    function loadScript(filename) {
        var id = "gabrielsroka_" + filename;
        if (document.getElementById(id)) {
             scriptLoaded();
             return;
        }
        var script = document.body.appendChild(document.createElement("script"));
        script.src = path + filename + ".js";
        script.type = "text/javascript";
        script.id = id;
        if (script.attachEvent) {
            script.attachEvent("onreadystatechange", function () {
                if (script.readyState == "loaded") {
                    scriptLoaded();
                }
            });
        } else {
            script.addEventListener("load", scriptLoaded, false);
        }
    }

    for (var s = 0; s < scripts.length; s++) {
    	loadScript(scripts[s]);
    }
})("https://gabrielsroka.github.io/webpages/scripts/", ["campuses", "js", "table", "dialog", "Request"],
function () {
    var path = "https://gabrielsroka.github.io/webpages/";
    
    function metadataLoaded(metadata) {
        if (typeof metadata == "string") { // Error string.
            throbber.innerHTML = metadata;
            return;
        }

        function Hash(domainNameRegExp) {
            this.domainNameRegExp = domainNameRegExp;
            this.length = 0;
        }
        Hash.prototype.pushIf = function (uri) {
            var matches = this.domainNameRegExp.exec(uri); // regExp.exec(s) returns Array if found, null otherwise.
            if (matches) {
                var domainName = matches[1];
                this[domainName] = uri;
                this.length++;
            }
        };
        var incHash = new Hash(campuses.domainNameRegExp);
        var as = document.getElementsByTagName("a"); // document.location == "http://www.incommonfederation.org/participants/"
        var span = document.getElementById("maincontent").getElementsByTagName("h1")[0].appendChild(document.createElement("span"));
        var csuRed = "#cf142b";
        span.innerHTML = " (CSU)&nbsp;";
        span.style.color = "white";
        span.style.backgroundColor = csuRed;
        for (var a = 0; a < as.length; a++) {
            incHash.pushIf(as[a].href);
            if (campuses.domainNameRegExp.exec(as[a].href)) {
                span = as[a].appendChild(document.createElement("span"));
                span.innerHTML = " (CSU)";
                span.style.color = "white";
                span.style.backgroundColor = csuRed;
            }
        }
/*
        var inc2 = new Hash(campuses.domainNameRegExp);
        var inc3 = new Hash(campuses.domainNameRegExp);
        var inc4 = new Hash(campuses.domainNameRegExp);
        as.forEach = Array.prototype.forEach;

        Array.forEach(document.getElementsByTagName("a"), function (a) {inc2.pushIf(a.href);});
        
        Array.forEach(document.getElementsByTagName("a"), inc3.pushIf, inc3);
        
        as.forEach(inc4.pushIf, inc4);
*/

        var incIdpHash = new Hash(campuses.domainNameRegExp);
        var eds = metadata.getElementsByTagName("EntityDescriptor");
        for (var e = 0; e < eds.length; e++) {
            if (eds[e].getElementsByTagName("IDPSSODescriptor").length) {
                incIdpHash.pushIf(eds[e].getAttribute("entityID"));
            }
        }

        campuses.incDateCount = 0;
        campuses.idpEntityIdCount = 0;
        for (var c = 0; c < campuses.length; c++) {
            var campus = campuses[c];
            campus.inc = incHash[campus.domainName] ? "yes" : "";
            campus.incIdp = incIdpHash[campus.domainName] ? "yes" : "";
            if (campus.idpEntityId && campus.incIdp) {
                campus.incIdp = "both";
            } else if (campus.idpEntityId) {
                campus.incIdp = "no";
            } else {
                campus.idpEntityId = incIdpHash[campus.domainName];
            }
            campuses.incDateCount += campus.incDate ? 1 : 0;
            campuses.idpEntityIdCount += campus.idpEntityId ? 1 : 0;
        }
                
        campuses.addRows = function (table) {
            for (var c = 0; c < this.length; c++) {
                var campus = this[c];
                campus.rowId = "r" + c; // Add short, unique id.
                var r = table.tBodies[0].insertRow(-1);
                r.id = campus.rowId;
                r.insertCell(-1).innerHTML = campus.name;
                // r.insertCell(-1).innerHTML = campus.inc;
                // r.insertCell(-1).innerHTML = campus.incDate || "";
                var idp = r.insertCell(-1);
                idp.innerHTML = campus.incIdp;
                var id = r.insertCell(-1);
                id.innerHTML = campus.idpEntityId || "";
                if (campus.incIdp == "no") idp.style.color = id.style.color = "blue";
            }
            r = table.createTFoot().insertRow(-1); // was tBodies[0]
            r.insertCell(-1).innerHTML = "Counts: " + this.length;
            // var inc = r.insertCell(-1);
            // inc.innerHTML = incHash.length;
            // if (incHash.length != campuses.incDateCount) inc.style.color = "red";
            // r.insertCell(-1).innerHTML = campuses.incDateCount;
            r.insertCell(-1).innerHTML = incIdpHash.length;
            r.insertCell(-1).innerHTML = campuses.idpEntityIdCount;
        };
        var text = "CSU Campuses" + '<link rel="stylesheet" type="text/css" href="' + path + 'table.css" />';
        var toolbar = window.clipboardData ? "<input type=button id=CopyButton value=Copy />" : "";
        var headers = [new Header("Campus", "name"), 
                       // new Header("InCommon?", "inc"), new Header("InC Date", "incDate"),
                       new Header("InC IdP?", "incIdp"), new Header("Entity ID", "idpEntityId")];
        headers.sortable = true;
        document.body.removeChild(throbber);
        var dialog = showDialog(text, toolbar, headers, campuses, function () {dialog.hide(); document.onmousemove = null;}, path);
        dialog.makeDraggable();
        document.getElementById(headers[0].id).title = "Last Modified: " + metadataRequest.lastModifiedDate.toDateTimeString() +
            ", \nURL: " + url;
        if (window.clipboardData) {
            document.getElementById("CopyButton").onclick = function () {
                var delim = "\n\n"; // 2 \n for Mike's XLS
                Campus.prototype.toString = function () { // Called by campuses.join().
                    return [this.name, this.inc, this.incDate || "", this.incIdp, this.idpEntityId || ""].join("\t");
                };
                clipboardData.setData("Text", headers.join("\t") + delim + campuses.join(delim) + delim + 
                    [campuses.length, incHash.length, campuses.incDateCount, incIdpHash.length, campuses.idpEntityIdCount].join("\t"));
            };
        }
    }
    
    function throb(title, path) {
        var throbber = document.body.appendChild(document.createElement("div"));
        var size = "300";
        throbber.innerHTML = "<table align=center><tr><td height=" + size + "><img src='" + path + "images/throbber.gif' />" + title + "</table>";
        throbber.style.position = "absolute";
        throbber.style.top = "120px";
        throbber.style.left = "450px";
        throbber.style.height = size + "px";
        throbber.style.width = size + "px";
        throbber.style.zIndex = 900;
        throbber.style.border = "2px solid";
        throbber.style.backgroundColor = "white"; // defaults to "transparent"
        return throbber;
    }
    
    var title = "&nbsp;Downloading metadata";
    if (navigator.userAgent.contains("Android")) title += " (takes 5-10 seconds on mobile devices)";
    var throbber = throb(title + "...", path);
    var url = "http://wayf.calstate.edu/metadata/InCommon-metadata.xml"; 
    if (window.XDomainRequest) {
        url = "http://wayf.incommonfederation.org/InCommon/InCommon-metadata.xml";
/*
        var metadataRequest = new XDomainRequest(); // XDR doesn't support .responseXML
        metadataRequest.onload = function () {
            var xml = this.responseText.replace(/xmlns\:xml=\"http\:\/\/www.w3.org\/XML\/1998\/namespace\"/g, "");
            metadataLoaded(new XML(xml));
        };
        metadataRequest.open("get", url);
        metadataRequest.send();
*/
    }
    var metadataRequest = new Request(url, null, metadataLoaded);
    metadataRequest.get();
});
