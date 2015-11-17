// Drag this to the bookmark toolbar:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/saml.js"})();

(function () {
    function parseResponse(responseText) {
        var match = responseText.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/);
        if (match) {
            var value = match[2].replace(/&#(x..?);/g, function (m, p) {return String.fromCharCode("0" + p)});
            var response = (match[1] == "SAMLResponse" ? atob(value) : value).replace(/\n/g, "");
            var highlight = "style='background-color: yellow'";
            response = response.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;").
                replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;").
                replace(/((Address|Issuer|NameID|NameIdentifier|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="|=&quot;))(.*?)(&lt;|"|&quot;)/g, "$1<span " + highlight + ">$4</span>$5");
            results.innerHTML = "<a onclick=this.parentNode.innerHTML=''>Clear</a><pre>" + indentXml(response, 4) + "</pre>";
        } else {
            results.innerHTML = "Error";
        }
    }
    var div = document.body.appendChild(document.createElement("div"));
    div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>&nbsp;SAML Response - X</a>";
    div.style.position = "absolute";
    div.style.zIndex = "1000";
    div.style.left = "4px";
    div.style.top = "4px";
    div.style.backgroundColor = "white";
    var results = div.appendChild(document.createElement("div"));
    var $ = window.jQuery || window.jQueryCourage;
    $("<a title='View SAML'>? - </a>").click(function () {
        results.innerHTML = "Loading . . .";
        var request = new XMLHttpRequest();
        request.open("get", this.parentNode.previousSibling.previousSibling.href);
        request.onload = function () {
            parseResponse(request.responseText);
        };
        request.send();
    }).prependTo(".app-button-name");
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
