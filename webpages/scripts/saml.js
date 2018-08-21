// Drag this to the bookmark toolbar:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/webpages/scripts/saml.js"})();

(function () {
    function parseResponse(responseText) {
        var match = responseText.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/);
        if (match) {
            var value = match[2].replace(/&#(x..?);/g, function (m, p) {return String.fromCharCode("0" + p)});
            var response = (match[1] == "SAMLResponse" ? atob(value) : value).replace(/\n/g, "");
            var highlight = "style='background-color: yellow'";
            response = response.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;").
                                replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;").
                                replace(/((Address|Issuer|NameID|NameIdentifier|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="))(.*?)(&lt;|")/g, "$1<span " + highlight + ">$4</span>$5");
            results.innerHTML = "<pre>" + indentXml(response, 4) + "</pre>";
        } else {
            results.innerHTML = "Error";
        }
    }
    var div = document.body.appendChild(document.createElement("div"));
    div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>&nbsp;SAML Response - X</a>" +
                    "<div id=results><form id=form><input id=url style='width:700px;' placeholder='URL'> <input type=submit value=Go></form></div>";
    div.style.position = "absolute";
    div.style.zIndex = "1000";
    div.style.left = "4px";
    div.style.top = "4px";
    div.style.backgroundColor = "white";
    var url = document.getElementById("url");
    url.focus();
    var results = document.getElementById("results");
    document.getElementById("form").onsubmit = function () {
        results.innerHTML = "Loading . . .";
        var request = new XMLHttpRequest();
        request.open("get", url.value);
        request.onload = function () {
            parseResponse(request.responseText);
        };
        request.send();
        return false;
    };
    function indentXml(xml, tabs) {
        var lines = xml.split("\n");
        var tab = 0;
        for (var li = 0; li < lines.length; li++) {
            var line = lines[li];
            var end = line.match("&lt;/");
            var empty = line.match("/&gt;") || line.match(/&gt;.*&gt;/);
            var indent  = !end && !empty;
            var outdent =  end && !empty;
            if (outdent) tab--;
            lines[li] = " ".repeat(tabs * tab) + line;
            if (indent) tab++;
        }
        return lines.join("\n");
    }
}
)();
