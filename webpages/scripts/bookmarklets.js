/// <reference path="base64.js" />
/// <reference path="js.js" />

// Bookmarklets and JavaScript Editor
// Copyright 2007-2022 Gabriel Sroka

var codeId = "code";
var debug;

onload = function () {
    var pres = document.getElementsByTagName("pre");
    for (var p = 0; p < pres.length; p++) {
        document.getElementById("a" + pres[p].id.substring(codeId.length)).href = "javascript:" + getText(pres[p]);
        document.getElementById("div" + pres[p].id).innerHTML = 
            indentCode(formatCode(getText(pres[p])), document.getElementById("tTabs").value, true).replace(/\n/g, "<br>");
    }
    showAnchorLengths();

    if (location.search !== "") {
        // e.g. http://*/bookmarklets.html?script=alert(1)
        var query = location.href.split("?")[1];
        var args = query.parseQueryString();
        if (args.script) {
            document.getElementById("taEdit").value = unescape(args.script);
            getTALength();
        }
    }

    debug = document.getElementById("taDebug");
    debug.toggle = function () {
        if (debug.style.display == "inline" || debug.style.display == "") {
            debug.style.display = "none";
        } else {
            debug.style.display = "inline";
        }
        onresize();
        document.getElementById("taEdit").focus();
    };
    
    debug.log = debug.print = function (s) {
        debug.value += (s ? s.toString() : s) + "\r\n";
        if (debug.doScroll) debug.doScroll();
    };
    
    debug.clear = function () {
        debug.value = "";
        return "";
    };
};

function pp(s) {
    if (Array.isArray(s)) {
        return '[' + s.map(i => pp(i)).join(', ') + ']';
    } else if (typeof s == 'object') {
        return '{' + Object.entries(s).map(([n, v]) => `${n}: ${pp(v)}`).join(', ') + '}';
    } else if (typeof s == 'string') {
        return `'${s}'`;
    } else return s;
}

onresize = function () {
    var height = document.body.parentNode.clientHeight || document.body.clientHeight;
    height = height - document.getElementById("dTop").offsetHeight - document.getElementById("dBottom").offsetHeight - 
             document.getElementById("taDebug").offsetHeight - 25;
    document.getElementById("taEdit").style.height = Math.max(height, 0) + "px";
};

function editor() {
    var div = document.body.appendChild(document.createElement("div"));
    div.id = "hEdit";
    var android = navigator.userAgent.match("Android");
    function accesskey(k) {
        return (android ? k : '<span class="u">' + k + '</span>');
    }
    
    var s = '';
    if (android) {
        s += '<h1>Bookmarklet JavaScript Editor</h1>';
        s += '<div id="dTop">';
    } else {
        s += '<div id="dTop">';
        s += '<h1>Bookmarklet JavaScript Editor</h1>';
    }
    s += '<a id="aRunBookmarklet" href="">Bookmarklet</a>&nbsp;';
    s += '<button onclick="runBookmarklet();" accesskey="R" title="Run (Ctrl + Enter or F2)">' + accesskey("R") + 'un</button>&nbsp;';
    s += '<button onclick="debug.toggle();" accesskey="b" title="Toggle Debug Window">De' + accesskey("b") + 'ug</button>&nbsp;';
    s += '<button onclick="writeHTML()" accesskey="L" title="Render HTML">HTM' + accesskey("L") + '</button>&nbsp;';
    s += '<button onclick="taEdit.value=``" accesskey="C">' + accesskey("C") + 'lear</button>&nbsp;';
    // s += '<button onclick="beautifyCode()" accesskey="b">' + accesskey("B") + 'eautify</button>&nbsp;';
    s += '<button onclick="parseEditor()" accesskey="p">' + accesskey("P") + 'arse</button>&nbsp;';
    s += '<button onclick="formatEditor()" accesskey="f">' + accesskey("F") + 'ormat</button>&nbsp;';
    s += '<button onclick="base64Decode()" accesskey="6" title="Base64 Decode">B' + accesskey("6") + '4 d</button>&nbsp;';
    if (!android) s += '<button onclick="xmlFormat()" accesskey="x" title="XML Format">' + accesskey("X") + 'ML</button>&nbsp;';
    s += '<button onclick="escapeURL()">Esc&nbsp;Url</button>&nbsp;';
    if (!android) s += '<button onclick="escapeCode()" accesskey="e" title="Escape Less Than">' + accesskey("E") + 'scape</button>&nbsp;';
    s += '<button onclick="indent_onclick()" accesskey="i">' + accesskey("I") + 'ndent</button>&nbsp;';
    s += accesskey("T") + 'ab Size: <input type="text" value="4" id="tTabs" size="1" accesskey="t" /> ';
    s += 'Length: <input type="text" value="0" id="tLen" size="4" />';
    s += '</div>';
    s += '<textarea id="taEdit" style="width: 99%;" cols="80" rows="25" ';
    s += 'onkeydown="getTALength();edit_onkeydown(event);" onkeyup="getTALength()" spellcheck="false" autocapitalize="none">';
    s += '(function () {\n';
    s += '\n';
    s += '}\n';
    s += ')();\n';
    s += '</textarea>';
    s += '<textarea id="taDebug" style="width: 99%;" cols="80" rows="5" title="debug.print(s); debug.clear();" ';
    s += 'spellcheck="false" autocapitalize="none"></textarea>';
    s += '<div id="dBottom">';

    s += '<a href="http://validator.w3.org/check?uri=referer">Valid HTML5</a> ';
    s += '<span id="LastModified" onmouseout="hideDate()"';
    s += 'onmouseover="showDate()">Last Modified</span>';
    s += '</div>';
    div.innerHTML = s;
    init();
    
    // document.styleSheets[0].addRule("button", "width: 66px");
    // document.styleSheets[0].addRule("span.u", "text-decoration: underline");
}

function escapeURL() {
    // Even though Android Browser 2.2 allows these unwiseDelims in URLs/bookmarks, if you use the context menu
    // on an unescaped bookmarklet, it escapes some characters, so it's best to still escape everything yourself.
    // See http://tools.ietf.org/html/rfc2396#section-2.4.3
    var unwiseDelims = /[ <>%"{}|\\^']/g;
    var url = "javascript:eval(unescape('"  + document.getElementById("taEdit").value.replace(unwiseDelims, function ($1) {
        return escape($1); // Passing escape directly to s.replace(re, escape) doesn't work in Firefox.
    }) + "'));";
    debug.print(url);
    document.getElementById("aRunBookmarklet").href = "http:/" + url;
}

function writeHTML() {
    newWindow(document.getElementById("taEdit").value);
}

function newWindow(html) {
    var newDocument = open().document;
    newDocument.writeln(html);
    newDocument.close();
}

function showAnchorLengths() {
    var as = document.getElementsByTagName("a");
    for (var a = 0; a < as.length; a++) {
        if (as[a].href.indexOf("javascript:") == 0 && as[a].id != "aRunBookmarklet") {
            var text = "(length = " + as[a].href.length + ") ";
            var span = document.createElement("span");
            span.appendChild(document.createTextNode(text));
            as[a].parentNode.appendChild(document.createTextNode(" "));
            as[a].parentNode.appendChild(span);
        }
    }
}

function init() {
    getTALength();
    onresize();
}

function parseCode(s, format) {
/// <summary>Add spaces and newlines to JavaScript code (pretty print).</summary>
/// <param name="s" type="String">JavaScript code.</param>
/// <param name="format" type="Boolean">Add syntax highlighting.</param>
/// <returns type="String">Formatted code.</returns>

    // with help from Narcissus: http://mxr.mozilla.org/mozilla/source/js/narcissus/
    var p;       // previous char
    var c = "";  // current char
    var n;       // next char
    var c2;      // current + next char
    var i = 0;   // index into s
    var o = "";  // output;
    var ps;      // output previous space
    var ns;      // output next space
    var nn;      // output next newline
    var par = 0; // level of parens
    var max = 0; // max keyword length + 1
    var w;       // current max # of chars
    var match;   // match array for RegExp.exec()
    var id;      // match on w, possibly a keyword
    var bs;      // keywords[id] (is id a keyword, and should it have a space after?)
    var inf = false;  // inside a "for" loop
    var indo = false; // inside a "do" loop
    var ic = false;   // inside a "case" or "default" statement

    // "n" = no space after
    var keywords = {"toString" : 0, "valueOf" : 0,
        "break" : "n", "case" : 1, "catch" : 1, "continue" : "n", "default" : "n", "delete" : 1, "do" : "n", "else" : "n",
        "false" : "n", "finally" : "n", "for" : 1, "function" : 1, "if" : 1, "in" : 1, "instanceof" : 1,
        "new" : 1, "null" : "n", "return" : "n", "switch" : 1, "this" : "n", "throw" : 1,
        "true" : "n", "try" : "n", "typeof" : 1, "var" : 1, "void" : 1, "while" : 1, "with" : 1
    };

    function getNext() {
        c = n;
        n = s.charAt(++i);
    }
    function span(s) { // s in ["keyword", "literal", "comment"]. corresponds to span.className for syntax highlighting
        return format ? "\rspan class='" + s + "'>" : "";
    }
    function endSpan() {
        return format ? "\r/span>" : "";
    }
    function getLiteral() { // Append entire string or regex literal to o.
        var q = c; // quote, apostrophe or slash ["'/]
        do {
            getNext();
            o += c;
            if (c == "\\") {  // Handle two-character escape sequence.
                getNext();    // Get escaped character.
                o += c;
                c = "";       // Hide escaped character.
            }
        } while (!(c == q || i >= s.length));
    }

    for (var prop in keywords) {
        max = Math.max(max, prop.length + 1);
    }

    s = s.replace(/\r\n/g, "\n");
    n = s.charAt(0);
    do {
        p = c;
        w = s.substr(i, max);
        getNext();
        ps = p == " " ? "" : " ";
        ns = n == " " ? "" : " ";
        nn = (n == "\n" || (/^[ \t]*\/[\/\*]/).test(w.substr(1))) ? "" : "\n";
        c2 = c + n;

        // The order of these if/else clauses matters somewhat (precedence), and they have been tuned for frequency.
        if ((match = (/^[ \t\n.\[\]]+/).exec(w))) { // skip spaces, tabs, newlines, periods, and brackets
            id = match[0];
            i += id.length - 2;
            n = s.charAt(i);
            getNext();
            o += id;
        } else if ((match = (/^\w+/).exec(w))) {
            id = match[0];
            i += id.length - 2;
            n = s.charAt(i);
            getNext();
            bs = keywords[id];
            if (bs) {
                ns = (n == " " || bs == "n") ? "" : " ";
                o += span("keyword") + id + endSpan() + ns;
                if (id == "for") {
                    inf = true;
                } else if (id == "do") {
                    indo = true;
                } else if (id == "case" || id == "default") {
                    ic = true;
                }
            } else {
                o += id;
            }
        } else if (c == '"' || c == "'" || c == '`') {  // "String" or 'String' or `String`
            o += span("literal") + c;
            getLiteral();
            o += endSpan();
        } else if (c == ";") {
            if (!inf || par == 0) {
                o += c + nn; // at EOL
            } else {
                o += c + ns; // in a "for" statement or other paren
            }
        } else if (c2 == "//") {  // single line comment
            getNext();
            o += span("comment") + c2;
            while (true) {
                getNext();
                if (c == "\n" || i >= s.length) {
                    o += endSpan() + c;
                    break;
                }
                o += c;
            }
        } else if (c2 == "/*") {  /* multi-line comment */
            getNext();
            o += span("comment") + c2;
            do {
                p = c;
                getNext();
                o += c;
            } while (!(c == "/" && p == "*"));
            o += endSpan();
        } else if (c == "/" && p == "(") {  // (/RegExp/)  . regexp must be enclosed in parens.
            o += span("literal") + c;
            getLiteral();
            while ((/[gim]/).test(n)) {
                getNext();
                o += c;
            }
            o += endSpan();
        } else if (c2 == "==" || c2 == "!=" || c2 == "&&" || c2 == "||" || c2 == "<=" || c2 == ">=" || c2 == "+=" || 
                   c2 == "-=" || c2 == "*=" || c2 == "/=" || c2 == "%=" || c2 == "&=" || c2 == "|=" || c2 == "^=" || 
                   c2 == "<<" || c2 == ">>" || c2 == '=>') {
            getNext();
            o += ps + c2;
            if ((c2 == "==" || c2 == "!=") && n == "=") { // "===" and "!=="
                getNext();
                o += c;
            }
            ns = n == " " ? "" : " ";
            o += ns;
        } else if (c2 == "++" || c2 == "--") {
            getNext();
            o += c2;
        } else if (c == "=" || c == "+" || c == "-" || c == "<" || c == ">" || c == "*" || c == "/" || c == "?" || 
                   c == ":" || c == "%" || c == "|" || c == "^" || c == "~") { // leave out "!"
            if (c == ":" && ic) {
                o += c + nn;
                ic = false;
            } else {
                o += ps + c + ns;
            }
        } else if (c == "(") {
            o += c;
            par++;
        } else if (c == ")") {
            o += c;
            par--;
            inf = false;
        } else if (c == "{") {
            o += ps + c + nn; // leave nn for indent
        } else if (c == "}") {
            // {
            if ((/^\s*(else|catch|finally)/).test(w.substr(1))) { // leave out "while" since it can appear before "{" or after "}"
                o += c + ns;
            } else if (indo && (/^\s*(while)/).test(w.substr(1))) { // handle "do/while"
                o += c + ns;
                indo = false;
            } else {
                o += c;
                if (n != ";") o += nn;
            }
        } else if (c == ",") {
            o += c + ns;
        } else {
            o += c;
        }
    } while (i < s.length);
    if (par != 0) alert("parens don't match: " + par);
    if (format) {
        o = o/*.replace(/&/g, "&amp;")*/.replace(/</g, "&lt;").replace(/\r/g, "<");
    }
    return o;
}

function base64Decode() {
    var taEdit = document.getElementById("taEdit");
    taEdit.value = Base64.decode(taEdit.value);
}

function xmlFormat() {
    var taEdit = document.getElementById("taEdit");
    var s = taEdit.value;
    if (!window.ActiveXObject) {
        s = XML.fixFirefox(s);
    }
    taEdit.value = new XML(s).toString();
    taEdit.focus();
}

function formatEditor() {
    var taEdit = document.getElementById("taEdit");
    newWindow('<meta name="viewport" content="initial-scale=1.0, minimum-scale=0.25"><link rel="stylesheet" type="text/css" href="syntax.css" />' + "\n<pre>\n" + 
              formatCode(taEdit.value) + 
              "\n</pre>");
}

function formatCode(s) {
    return parseCode(s, true);
}

function parseEditor() {
    var taEdit = document.getElementById("taEdit");
    taEdit.value = parseCode(taEdit.value, false);
    taEdit.focus();
}

function showDate() {
    setDate(": " + new Date(document.lastModified).toDateTimeString() + " (" + document.compatMode + ")");
}

function hideDate() {
    setDate("");
}

function setDate(s) {
    setText(document.getElementById("LastModified"), "Last Modified" + s);
}

function copyCode(id) {
    copyText(getText(document.getElementById(codeId + id)));
}

function copyText(text) {
    if (window.clipboardData) {
        window.clipboardData.setData("Text", text);
    } else {
        alert("Copy not supported on this browser (try IE)");
    }
}

function escapeCode() {
    var taEdit = document.getElementById("taEdit");
    taEdit.value = taEdit.value.replace(/</g, "&lt;");
}

function edit_onkeydown(event) {
    var ENTER = 13, F2 = 113;
    event = window.event || event;
    if (event.keyCode == F2) {
        if (event.shiftKey) {
            findText();
        } else {
            runBookmarklet();
        }
    } else if (event.keyCode == ENTER && event.ctrlKey) {
        runBookmarklet();
    }
}

function findText() {
    var r = document.selection.createRange();
    if (r.text != "") {
        if (r.findText("function " + r.text, -1) || r.findText("function " + r.text) ||
            r.findText("var " + r.text, -1) || r.findText("var " + r.text)) {
            r.select();
        } else {
            alert(r.text + " not found");
        }
    }
}

function runBookmarklet() {
    var aRun = document.getElementById("aRunBookmarklet");
    try {
        document.location.href = aRun.href; // IE supports aRun.click(), but it's not standard.
    } catch (e) { // IE doesn't seem to catch run-time errors unless you use window.onerror.
        alert("Error: " + e);
    }
}

function getTALength() {
    var taEdit = document.getElementById("taEdit");
    document.getElementById("aRunBookmarklet").href = "javascript:" + taEdit.value;
    var len = document.getElementById("aRunBookmarklet").href.length;
    var tLen = document.getElementById("tLen");
    tLen.value = len;
    tLen.style.backgroundColor = "";
}

function editCode(id) {
    var taEdit = document.getElementById("taEdit");
    var code = document.getElementById(codeId + id);
    taEdit.value = getText(code);
    getTALength();
    document.getElementById("aRunBookmarklet").innerHTML = document.getElementById("a" + id).innerHTML;
    document.getElementById("hEdit").scrollIntoView();
    taEdit.focus();
}

function toggleAll() {
    var display, buttonText, b = document.getElementById("bToggleAll");
    if (b.innerHTML == "Show All") {
        b.innerHTML = "Hide All";
        display = "inline";
        buttonText = "Hide";
    } else {
        b.innerHTML = "Show All";
        display = "none";
        buttonText = "Show";
    }
    var pres = document.getElementsByTagName("pre");
    for (var p = 0; p < pres.length; p++) {
        var id = pres[p].id.substring(codeId.length);
        document.getElementById("div" + id).style.display = display;
        document.getElementById("b" + id).innerHTML = buttonText;
    }
}

function toggleCode(id) {
    var d = document.getElementById("div" + id), b = document.getElementById("b" + id);
    if (d.style.display == "inline") {
        d.style.display = "none";
        b.innerHTML = "Show";
    } else {
        d.style.display = "inline";
        b.innerHTML = "Hide";
    }
}

function indent_onclick() {
    var taEdit = document.getElementById("taEdit");
    taEdit.value = indentCode(taEdit.value, document.getElementById("tTabs").value, false);
    getTALength();
    taEdit.focus();
}

function indentCode(textIn, tabs, format) {
    var tab = 0, lines = textIn.replace(/\r\n/g, "\n").split("\n"), line, word, label;
    // TODO: fix: one-line ifs, etc. ignores braces in quotes, RegExes, comments, etc.
    for (var l = 0; l < lines.length; l++) {
        line = lines[l];
        line = line.replace(/^\s*/, "");      // Remove leading whitespace.
        word = line.match(/[^\s\('"\:]*/)[0]; // Find first word.

        var startBrace = line.indexOf("{") != -1;
        var endBrace   = line.indexOf("}") != -1;
        label = false;
        var switchSpace = 0;
        if (word == "case" || word == "default") {
            tab--;
            switchSpace = tabs / 2;
        } else if (endBrace) {
            tab--;
        } else if (line.endsWith(":")) {
            label = true;
        }
        if (label) {
            lines[l] = line;
        } else {
            lines[l] = spaces(tabs * tab + switchSpace, format) + line;
        }
        if (word == "case" || word == "default" || startBrace) {
            tab++;
        }
    }
    if (tab != 0) {
        alert("braces don't match: " + tab);
    }
    return lines.join("\n");
}

function spaces(num, format) {
    var s = "", sSpaces = "                                                                                              ";
    if (format) {
        for (var i = 0; i < num; i++) {
            s += "&nbsp;";
        }
    } else {
        s = sSpaces.substring(0, num);
    }
    return s;
}

function showObject(win, o, sTitle, ro) {
    // Microsoft has broken all old-style MSDN URLs. They seem to be fixed now (2/16/2010).
    var a = [], d = win.document, s = "", newO, oType, newTitle, tagName = "", l = "";
    var link = "<a href=\"javascript:window.opener.showObject(window,";
    var msdnDir, msdnURL = "http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/reference/";
    try {
        if (o.length) l = " (length=" + o.length + ")";
    } catch (ex) {
    }
    l += makeTag(o, msdnURL);
    for (var p in o) {
        try {
            s = o[p];
            tagName = "";
            oType = typeof s;
            msdnDir = "properties/";
            if ((oType == "object" && p != 'Packages' && p != 'java' && p != 'sun') || oType == "function") {
                if (s !== null) {
                    tagName = makeTag(o[p], msdnURL);
                    if (isNaN(p)) {
                        newO = ro + "." + p;
                        newTitle = sTitle + "." + p;
                    } else {
                        newO = ro + "[" + p + "]";
                        newTitle = sTitle + "[" + p + "]";
                    }
                    try {
                        s = s.toString();
                    } catch (ex) {
                        s = s + "";
                    }
                    if (oType == "function") {
                        s = "<pre>" + s.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>";
                    } else {
                        if (s) s = link + newO + ",'" + newTitle + "','" + newO + "')\">" + s + "</a>";
                    }
                }
                if (p.indexOf("on") == 0) {
                    msdnDir = "events/";
                } else {
                    msdnDir = "objects/";
                }
            } else if (oType == "string") {
                s = '"' + s.replace(/</g, "&lt;").replace(/>/g, "&gt;<br>") + '"';
            }
            if (isNaN(p)) {
                p = getLink(msdnDir, p, msdnURL);
            } else {
                p = "     ".substring(0, 5 - p.length) + parseInt(p);
            }
            a.push("<tr><td>" + p + "<td>" + oType + tagName + "<td>" + s);
        } catch (ex) {
            continue;
        }
    }
    a.sort();
    d.open();
    d.writeln("<title>" + sTitle + "</title>" + sTitle.replace(/window./, link + 
        "window.opener,'window','window.opener')\">window</a>.") + l);
    d.writeln("<style>body {font-family: Arial} table {border-collapse: collapse} " + 
        "td {border: 1px solid silver; vertical-align: text-top; padding: 2px}</style>");
    d.writeln("<table>" + a.join("\n") + "</table>");
    d.close();
}

function makeTag(o, msdnURL) {
    try {
        if (o.tagName) {
            return "&nbsp;<a target='_blank' href='" + msdnURL + "objects/" + o.tagName + ".asp'>" + o.tagName + "</a>";
        } else {
            return "";
        }
    } catch(ex) {
        return "";
    }
}

function getLink(msdnDir, p, msdnURL) {
    var o = p;
    switch (p) {
      case "all":
      case "anchors":
      case "applets":
      case "attributes":
      case "behaviorUrns":
      case "childNodes":
      case "children":
      case "embeds":
      case "filters":
      case "forms":
      case "frames":
      case "images":
      case "links":
      case "namespaces":
      case "plugins":
      case "scripts":
      case "styleSheets":
        msdnDir = "collections/";
        break;
      case "clientInformation":
      case "document":
      case "event":
      case "history":
      case "implementation":
      case "location":
      case "navigator":
      case "screen":
      case "selection":
      case "window":
      case "XMLHttpRequest":
        o = "obj_" + p;
        break;
      case "activeElement":
      case "documentElement":
      case "firstChild":
      case "frameElement":
      case "lastChild":
      case "nextSibling":
      case "nodeValue":
      case "offsetParent":
      case "ownerDocument":
      case "parent":
      case "parentElement":
      case "parentNode":
      case "parentTextEdit":
      case "parentWindow":
      case "previousSibling":
      case "recordNumber":
      case "self":
        msdnDir = "properties/";
        break;
      case "src":
      case "title":
      case "top":
        msdnDir = "properties/";
        o = p + "_1";
        break;
      case "name":
        o = p + "_5";
        break;
      case "status":
        o = p + "_0";
        break;
    }
    return p + "&nbsp;<a target='_blank' href='" + msdnURL + msdnDir + o + ".asp'>^</a>";
}

/*
function editorAjax() {
    var d = document.body.appendChild(document.createElement("div"));
    d.id = "hEdit";
    var request = new Request("http://gabrielsroka.googlepages.com/editor.htm", null, function (xml) {
        document.getElementById("hEdit").innerHTML = xml; // TODO: change this to req.responseText
        init();
    });
    request.get();
}
*/


// function beautifyCode() {
// var reIn     = (/(for|if|switch|while|catch|with|\))\s*([\(\{])/g);
// // }
// var rePre    = (/\b(\{)/g);
// var rePost   = (/([,;\}])\b/g);
// var reOut    = (/\s*(==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||<<|>>|[=<>\?])\s*/g);
// var reString = (/^"(?:\\.|[^"])*"|^'(?:\\.|[^'])*'/);
// var reRegExp = (/^\/((?:\\.|[^\/])+)\/([gim]*)/);
// var reComment= (/^\/(?:\*(?:.|\n)*?\*\/|\/.*)/);
// var taEdit = document.getElementById("taEdit");
// taEdit.value = taEdit.value.replace(reIn, "$1 $2").replace(rePre, " $1").replace(rePost, "$1 ").replace(reOut, " $1 ");
// }

/*
function test(){
    var a,b;
    for(var i=0;i<s.length;s++,t--){
        a="for(";
        a[0]+=1+2-3;
        b=c==d?e:f;
    }
    for(p in o){
        alert(o[p]);
    }
    if(a==b&&c>=d){
        b-=1;
    }else if(a!=b||c<=d){
        b*=0;
    }
    switch(s){
      case "a":
        b();
      default:
        c();
    }
    while(true){
    }
    do{
    }while(true);
    try{
    }catch(ex){
    }
    with(o){
    }
}

function test2(){var a,b;for(var i=0;i<s.length;s++,t--){a="for(";a[0]+=1+2-3;b=c==d?e:f;}for(p in o){alert(o[p]);}
if(a==b&&c>=d){b-=1;}else if(a!=b||c<=d){b*=0;}switch(s){case"a":b();default:c();}while(true){}do{}while(true);
try{}catch(ex){}with(o){}}
*/


/*
function clarity() {
    var hs = document.getElementsByName("actuals_hours");
    for (var h = 0; h < hs.length; h++) {
        hs[h].onblur = hour_onblur;
    }
}

function hour_onblur() {
    var f = document.forms["page"], ts = f.getElementsByTagName("table"), rs, ds, d, a = [], b, v;
    for (var t = 0; t < ts.length; t++) {
        if (ts[t].className == "tableGridList") {
            rs = ts[t].getElementsByTagName("tr");
            for (var r = 1; r < rs.length; r++) {
                if (rs[r].className == "total") {
                    ds = rs[r].getElementsByTagName("td");
                    b = 0;
                    for (d = 0; d < ds.length; d++) {
                        if (ds[d].align == "right") {
                            if (a[b] != undefined) {
                                ds[d].innerHTML = a[b].toFixed(2);
                                ds[d].style.backgroundColor = "#98FB98";
                            }
                            b++;
                        }
                    }
                } else {
                    ds = rs[r].getElementsByTagName("input");
                    b = 0;
                    for (d = 0; d < ds.length; d++) {
                        if (ds[d].name == "actuals_hours") {
                            if (!a[b]) a[b] = 0;
                            v = parseFloat(ds[d].value);
                            if (v) a[b] += v;
                            b++;
                        }
                    }
                }
            }
        }
    }
}

function clarityLite() {
    var hs = document.getElementsByName("actuals_hours");
    for (var h = 0; h < hs.length; h++) {
        hs[h].onblur = hour_onblurlite;
    }
}

function hour_onblurlite() {
    var hs = document.getElementsByName("actuals_hours"), h, s = 0;
    for (h = 0; h < hs.length; h++) {
        if (hs[h].value) {
            s += parseFloat(hs[h].value);
        }
    }
}
*/

// Bookmark All using this regular expression: function.*\(.*\).*\{
// }
