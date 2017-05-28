/* 
This bookmarklet show SAML/WS-Fed assertions and other SSO information.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/saml.js";})();

Usage:
1. Login to Okta.
2. Click the bookmark from your toolbar.
3. Below each chicklet, there's a Show SSO link. Click one to see the SSO information.
*/

(function () {
    var results;
    var label = "Show SSO";
    var labels = document.getElementsByClassName("app-button-name");
    if (labels.length > 0) { // Button labels on Okta homepage
        for (var i = 0; i < labels.length; i++) {
            if (!labels[i].innerHTML.match(label)) {
                var a = document.createElement("a");
                a.onclick = function () {
                    createDiv();
                    getSSO(this.parentNode.previousSibling.previousSibling.href);
                };
                a.innerHTML = "<br>" + label;
                labels[i].appendChild(a);
            }
        }
    } else {
        createDiv();
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
    function createDiv() {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>SSO - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        results = div.appendChild(document.createElement("div"));
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
}
)();
