/// <reference path="scripts/js.js" />
/// <reference path="scripts/dialog.js" />
/// <reference path="scripts/table.js" />

// Copyright 2008-2012 Gabriel Sroka

// Install thusly:
/*
javascript:(function(){document.body.appendChild(document.createElement("script")).src="http://webpages.charter.net/gabrielsroka/bmenu.js";})();
*/

// This anonymous function is called when Greasemonkey/bookmarklet loads this file.
(function (path, scripts, allScriptsLoaded) {
    var scriptsLoaded = 0;
    function scriptLoaded() {
        scriptsLoaded++;
        if (scriptsLoaded == scripts.length) allScriptsLoaded(path);
    }
    function loadScript(filename) {
        var id = "gsroka_" + filename;
        if (document.getElementById(id)) {
             scriptLoaded();
             return;
        }
        var script = document.body.appendChild(document.createElement("script"));
        script.src = path + "scripts/" + filename + ".js";
        script.type = "text/javascript";
        script.id = id;
        if (script.addEventListener) {
            script.addEventListener("load", scriptLoaded, false);
        } else {
            script.attachEvent("onreadystatechange", function () {
                if (script.readyState == "loaded") {
                    scriptLoaded();
                }
            });
        }
    }

    for (var s = 0; s < scripts.length; s++) {
    	loadScript(scripts[s]);
    }
})("http://webpages.charter.net/gabrielsroka/", ["js", "table", "dialog"],
function (path) {
    var menus = [ // Do not use ' in links. Use " instead.
        {name: "Alert Cookies", link: 'alert(document.cookie);'},
        {name: "Cookie Window", link: 'cookieWindow();'},
        {name: "New Cookie Window", link: 'newCookieWindow();'},
        {name: "Alert Source", link: 'alert(document.body.parentNode.innerHTML);'},
        {name: "viewText", link: 'viewText();'},
        {name: "viewDomSource", link: 'viewDomSource();'},
        {name: "ajaxViewSource", link: 'ajaxViewSource();'},
        {name: "slayeroffice Show Source", link: 'loadScript("http://slayeroffice.com/tools/showSource/showSource.php?p=" + location);'},
        {name: "Show Scripts", link: 'showScripts();'},
        {name: "QR Code Generator", link: 'location = "http://chart.apis.google.com/chart?cht=qr&chs=350x350&chl=" + location;'},
        {name: "Share via email", link: 'shareViaEmail();'},
        {name: "slayeroffice favelet suite", link: 'loadScript("http://slayeroffice.com/tools/suite/suite.js");'},
        {name: "youtube", link: 'youtube();'},
        {name: "InC Parts", link: 'document.getElementById("dialog").hide(); loadScript("' + path + 'scripts/showCampuses.js");'},
        {name: "scaleableize", link: 'scaleableize();'},

//        {name: "", link: '();'},
        {name: "Snoopy", link: 'snoopy();'}
    ];
    
    menus.addRows = function (table) {
        for (var c = 0; c < this.length; c++) {
            var menu = this[c];
            menu.rowId = "r" + c; // Add short, unique id.
            var r = table.tBodies[0].insertRow(-1);
            r.id = menu.rowId;
            r.insertCell(-1).innerHTML = "<a href='javascript:" + menu.link + "'>" + menu.name + "</a>";
        }
    };
    var text = '<a href=\'' + path + 'bmenu.htm#javascript:(function(){document.body.appendChild(document.createElement("script")).src="' + 
                    path + 'bmenu.js";})();\'>Bmenu</a> - ' +
               '<a href="' + path + 'bmenu.js">Source</a>' +
               '<link rel="stylesheet" type="text/css" href="' + path + 'table.css" />';
    var toolbar = "";
    var headers = [new Header("Menu", "name")];
    var dialog = showDialog(text, toolbar, headers, menus, function () {dialog.hide(); document.onmousemove = null;}, path);
});


function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function eraseCookie(name) {
    createCookie(name, "",  -1);
}
function parseCookie(cookie) {
    var pos = cookie.indexOf("="); // cookie.split("=") will return too many pieces if there are "=" in the value. we want 2 pieces: name and value.
    return {name: cookie.substr(0, pos), value: unescape(cookie.substr(pos + 1))};
}

// Menu items

function cookieWindow() {
    var w = document.body.appendChild(document.createElement("div"));
    w.id = "cookieWindow";
    w.style.position = "absolute";
    w.style.left = "5px";
    w.style.top = "5px";
    w.style.zIndex = 1000;
    //w.style.color = "white";
    w.style.backgroundColor = "#f5faff";
    var cookies = document.cookie.split("; ");
    var s = "<a href='javascript:document.body.removeChild(document.getElementById(\"cookieWindow\"));void 0;'>Cookies - X</a><table>";
    for (var c = 0; c < cookies.length; c++) {
        var cookie = parseCookie(cookies[c]);
        s += "<tr><td>" + unescape(cookies[c]) + "<td><a href='javascript:eraseCookie(\"" + cookie.name + "\")'>clear</a>";
    }
    s += "</table>";
    w.innerHTML = s;
}

function newCookieWindow() {
    function showCookies() {
        var cookies = document.cookie.split("; ");
        cookies.sort(caseInsensitiveComparer);
        document.writeln("Cookies (last updated: " + Date() + ")<br><br>");
        document.writeln("<table>");
        for (var c = 0; c < cookies.length; c++) {
            var cookie = parseCookie(cookies[c]);
            // TODO: "<input name='" + cookie.name + "' size='" + (cookie.value.length * 1.4) + "' value='" + cookie.value + "' onblur='document.cookie=this.name+\"=\"+this.value'>"
            document.writeln("<tr bgcolor=#f5faff><td>" + cookie.name + "<td>" + cookie.value);
        }
        document.writeln("</table>");
    }
    showWindow(open(), "Cookies", ["<script>", comparer, caseInsensitiveComparer, parseCoookie, showCookies, "onload = showCookies;", "</script>"].join("\n"));
}

// View Source
function ajaxViewSource() {
    var sourceWindow = open();
    if (!sourceWindow) {
        alert("Disable pop-up blocker");
        return;
    }
    ajaxGet(location, function (request) {
        viewSource(sourceWindow, "Ajax", request.responseText);
    });
}

function ajaxGet(url, responseLoaded) {
    var request = new XMLHttpRequest();
    request.open("get", url, true);
    request.onreadystatechange = function () {
        var DONE = 4, OK = 200;
        if (request.readyState == DONE && request.status == OK) {
            responseLoaded(request);
        }
    };
    request.send();
}

function viewText() {
    showWindow(open(), "Text", document.body.innerText);
}

function viewDomSource() {
    viewSource(open(), "DOM", document.documentElement.innerHTML);
}

function viewSource(newWindow, sourceType, source) {
    showWindow(newWindow, sourceType + " source of: " + location, "<pre wrap>" + escapeSrc(source) + "</pre>");
}

function showScripts() {
    var scripts = document.getElementsByTagName("script"), srcs = ["Scripts in: " + location];
    for (var s = 0; s < scripts.length; s++) if (scripts[s].src && !scripts[s].src.contains("gabrielsroka")) srcs.push(scripts[s].src.link(scripts[s].src));
    showWindow(open(), srcs[0], srcs.join("<br>\n"));
}

function escapeSrc(text) {
    return text.
            replace(/</g, "&lt;").
            replace(/( (?:src|href)=")(.+?)(")/g, "$1<a target=_blank href=$2>$2</a>$3");
}

function showWindow(newWindow, title, body) {
    var newDocument = newWindow.document;
    newDocument.open();
    newDocument.write("<html><head><meta name='viewport' content='initial-scale=1.0'/><title>" +  title + "</title></head>" +
            "<body>\n" + body + "\n</body></html>");
    newDocument.close();

}

function scaleableize() {
    var metas = document.getElementsByTagName("meta");
    for (var m in metas) {
        if (metas[m].name == "viewport") {
            metas[m].content = "initial-scale=1.0, minimum-scale=0.25";
        }
    }
    var newDocument = open().document;
    newDocument.open();
    newDocument.write("<html>" + document.documentElement.innerHTML + "</html>");
    newDocument.close();
}

function shareViaEmail() {
    location = "mailto:?body=" + encodeURIComponent("from " + location + "\n\n[begin quote]\n" + getSelection() + "\n[end quote]");
}

function youtube() {
    var v = prompt("YouTube URL:").split("=")[1]; // http://www.youtube.com/watch?v=FXdOPFpsibw
    showWindow(open(), "YouTube", '<object width="560" height="349"><param name="movie" ' +
            'value="http://www.youtube.com/v/' + v + '?fs=1&amp;hl=en_US"></param><param name="allowFullScreen" ' +
            'value="true"></param><param name="allowscriptaccess" value="always"></param><embed ' +
            'src="http://www.youtube.com/v/' + v + '?fs=1&amp;hl=en_US" type="application/x-shockwave-flash" ' +
            'allowscriptaccess="always" allowfullscreen="true" width="560" height="349"></embed></object>');
// New syle doesn't work:
//    ydoc.writeln('<iframe title="YouTube video player" width="560" height="349" ' +
//        'src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>');
}


// See http://snoopy.allmarkedup.com
function snoopy() {
    var d = document, s, e;
    var el = d.getElementById('snpy');
    if (typeof Snoopy != 'undefined') {
        Snoopy.toggle();
        return;
    } else if (el) {
        el.className = /closed/.test(el.className) ? el.className.replace('closed', '') : el.className + ' closed';
        return;
    }
    s = d.createElement('link');
    s.setAttribute('href', 'http://snoopy-assets.allmarkedup.com/snoopy-min.css');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('type', 'text/css');
    d.getElementsByTagName('head')[0].appendChild(s);
    e = d.createElement('script');
    e.setAttribute('src', 'http://snoopy-assets.allmarkedup.com/snoopy-min.js');
    d.getElementsByTagName('body')[0].appendChild(e);
}
