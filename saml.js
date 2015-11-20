// Drag this to the bookmark toolbar:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/saml.js"})();

(function () {
    var $ = window.jQuery || window.jQueryCourage;
    var results;
    if ($ && $(".app-button-name").length > 0) {
        $("<br><a>View SAML</a>").click(function () {
            var div = createDiv();
            results = div.appendChild(document.createElement("div"));
            results.innerHTML = "Loading . . .";
            var request = new XMLHttpRequest();
            request.open("get", this.parentNode.previousSibling.previousSibling.href);
            request.onload = function () {
                parseResponse(request.responseText);
            };
            request.send();
        }).appendTo(".app-button-name");
    } else {
        var div = createDiv();
        results = div.appendChild(document.createElement("div"));
        var form = results.appendChild(document.createElement("form"));
        var url = form.appendChild(document.createElement("input"));
        url.style.width = "700px";
        url.placerholder = "URL";
        url.focus();
        var input = form.appendChild(document.createElement("input"));
        input.type = "submit";
        input.value = "Go";
        form.onsubmit = function () {
            results.innerHTML = "Loading . . .";
            var request = new XMLHttpRequest();
            request.open("get", url.value);
            request.onload = function () {
                parseResponse(request.responseText);
            };
            request.send();
            return false;
        };
    }
    function createDiv() {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>&nbsp;SAML Response - X</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        return div;
    }
    function parseResponse(responseText) {
        var match = responseText.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/);
        if (match) {
            var value = match[2].replace(/&#(x..?);/g, function (m, p) {return String.fromCharCode("0" + p)});
            var response = (match[1] == "SAMLResponse" ? atob(value) : value).replace(/\n/g, "");
            var highlight = "style='background-color: yellow'";
            response = response.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;").
                replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;").
                replace(/((Address|Issuer|NameID|NameIdentifier|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="|=&quot;))(.*?)(&lt;|"|&quot;)/g, "$1<span " + highlight + ">$4</span>$5");
            results.innerHTML = "<pre>" + indentXml(response, 4) + "</pre>";
        } else {
            results.innerHTML = "No SAML found. Is this a SWA app?";
        }
    }
    function indentXml(xml, size) {
        var lines = xml.split("\n");
        var level = 0;
        for (var li = 0; li < lines.length; li++) {
            var line = lines[li];
            var end = line.match("&lt;/");
            var empty = line.match("/&gt;") || line.match(/&gt;.*&gt;/);
            if (end && !empty) level--;
            lines[li] = " ".repeat(size * level) + line;
            if (!end && !empty) level++;
        }
        return lines.join("\n");
    }
}
)();
