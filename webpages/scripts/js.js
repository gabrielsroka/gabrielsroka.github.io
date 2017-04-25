// Copyright 2008-2014 Gabriel Sroka
// see http://weblogs.asp.net/bleroy/archive/2007/04/23/the-format-for-javascript-doc-comments.aspx

function $(id) {
	return document.getElementById(id);
}

function comparer(o1, o2, asc) {
/// <summary>Compares two objects: anArray.sort(comparer).</summary>
/// <param name="o1" type="Object">An object.</param>
/// <param name="o2" type="Object">An object.</param>
/// <param name="asc" type="Boolean">Sort ascending? [optional]</param>
/// <returns type="Number"></returns>

    var order = asc == undefined || asc ? 1 : -1; // sort ascending or descending
    var comparison;
    if (o1 == undefined) {
        comparison = -1;
    } else if (o2 == undefined) {
        comparison = 1;
    } else if (o1 < o2) {
        comparison = -1;
    } else if (o1 > o2) {
        comparison = 1;
    } else {
        comparison = 0;
    }
    return order * comparison;
}

function caseInsensitiveComparer(s1, s2, asc) {
/// <summary>Compares two strings: anArray.sort(caseInsensitiveComparer).</summary>
/// <param name="s1" type="String">A string.</param>
/// <param name="s2" type="String">A string.</param>
/// <param name="asc" type="Boolean" optional="true">Sort ascending?</param>
/// <returns type="Number"></returns>
    
    return comparer(s1.toLowerCase(), s2.toLowerCase(), asc);
}

function objectPropertyComparer(o1, o2, prop, asc) {
    return comparer(o1[prop], o2[prop], asc);
}

Date.prototype.toDateTimeString = function () {
/// <summary>Formats a Date as "ddd mmm dd yyyy hh:mm:ss ampm".</summary>
/// <returns type="String">Format: "ddd mmm dd yyyy hh:mm:ss ampm"</returns>

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hr24 = this.getHours(); // range: 0-23 (24-hour clock)
    var hr12;                   // range: 1-12 (12-hour clock. use with ampm)
    if (hr24 == 0) {
        hr12 = 12;
    } else if (hr24 <= 12) {
        hr12 = hr24;
    } else {
        hr12 = hr24 - 12;
    }
    var min = this.getMinutes().zeroPad();
    var sec = this.getSeconds().zeroPad();
    var ampm = hr24 < 12 ? "AM" : "PM";
    return days[this.getDay()] + " " + months[this.getMonth()] + " " + this.getDate() + " " + this.getFullYear() + " " + 
           hr12 + ":" + min + ":" + sec + " " + ampm;     
};

function getText(element) {
/// <param name="element" type="domElement" />

    if (element.textContent) {
        return element.textContent; // FF
    } else {
        return element.innerText; // IE, WebKit
    }
}

function setText(element, text) {
    if (element.textContent) {
        element.textContent = text; // FF
    } else {
        element.innerText = text; // IE, WebKit
    }
}

function handleMousewheel(element, listener) {
    if (element.addEventListener) {
        element.addEventListener("DOMMouseScroll", listener, false); // FF
        element.addEventListener("mousewheel",     listener, false); // WebKit, IE 9
    } else {
        element.attachEvent("onmousewheel", listener); // IE < 9
    }
}

// Don't use Number.toLocaleString()!
Number.prototype.format = function () {
/// <summary>Add "," every 3 digits.</summary>
    var ts = this.toString(), s = "";
    for (var i = 1; i <= ts.length; i++) {
        s = ts.charAt(ts.length - i) + s;
        if (i < ts.length && i % 3 == 0) {
            s = "," + s;
        }
    }
    return s;
};

Number.prototype.zeroPad = function () {
/// <summary>Add a leading zero.</summary>
    if (this < 10) {
        return "0" + this;
    } else {
        return this.toString();
    }
};

Math.pmt = function (rate, nper, pv) {
    return pv * rate / (1 - Math.pow(1 + rate, -nper));
};

// Bookmarklet
/*
javascript:
(function () {
    var scripts = ["csu", "campuses", "js", "table", "dialog", "Request"];
    function loadScript(path, filename, scriptLoaded) {
        var id = "calstate_" + filename;
        if (document.getElementById(id)) {
             scriptLoaded();
             return;
        }
        var script = document.body.appendChild(document.createElement("script"));
        script.type = "text/javascript";
        script.src = path + filename + ".js";
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
    function scriptLoaded() {
        scriptsLoaded++;
        if (scriptsLoaded == scripts.length) showCampuses();
    }
    var scriptsLoaded = 0;
    var path = "https://mysite.calstate.edu/personal/csuco_gsroka/scripts/";
    for (var s = 0; s < scripts.length; s++) {
        loadScript(path, scripts[s], scriptLoaded);
    }
}
)()

// - or -

javascript:
(function () {
    var s = document.body.appendChild(document.createElement("script")), p = "https://mysite.calstate.edu/personal/csuco_gsroka/scripts/";
    s.type = "text/javascript";
    s.src = p + "js.js";
    var src = p + "SharePoint.js", callback = function () {doSendLink();};
    if (s.attachEvent) {
        s.attachEvent("onreadystatechange", function () {
            if (s.readyState == "loaded") {
                loadScript(src, callback);
            }
        });
    } else {
        s.addEventListener("load", function () {
            loadScript(src, callback);
        }, false);
    }
}
)()
*/

function loadScript(src, callback) {
    var script = document.body.appendChild(document.createElement("script"));
    script.type = "text/javascript";
    script.src = src;
    if (callback) {
        if (script.addEventListener) {
            script.addEventListener("load", function () {
                callback();
            }, false);
        } else {
            script.attachEvent("onreadystatechange", function () { // IE (use "onreadystatechange" since "onload" doesn't work)
                if (script.readyState == "loaded") {
                    callback();
                }
            });
        }
    }
}

// regExp.test(string) returns Boolean
// regExp.exec(string) returns Array or null

// string.search(regExp) returns position Number
// string.match(regExp) return Array or null

String.prototype.left = function (length) {
    return this.substr(0, length);
};

String.prototype.right = function (length) {
    return this.substr(this.length - length);
};

String.prototype.startsWith = function (value) {
/// <param name="value" type="String"></param>
/// <returns type="Boolean">true if string starts with value</returns>

    return this.left(value.length) == value;
};

String.prototype.endsWith = function (value) {
/// <param name="value" type="String"></param>
/// <returns type="Boolean">true if string ends with value</returns>

    return this.right(value.length) == value;
};

String.prototype.contains = function (value) {
/// <param name="value" type="String"></param>
/// <returns type="Boolean">true if value occurs within this string</returns>
    return this.indexOf(value) >= 0;
};

String.prototype.parseQueryString = function (delim, assign) {
/// <summary>Convert query string to hashtable, e.g. "a1=v1&a2=v2&a3=v3" to {a1: "v1", a2: "v2", a3: "v3"}.</summary>
/// <returns type="Object">Hashtable</returns>

    delim = delim || "&";
    assign = assign || "=";
    var args = this.split(delim), nameValueHash = {}, nameValue, name, value;
    for (var arg = 0; arg < args.length; arg++) {
        nameValue = args[arg].split(assign);
        name = nameValue[0];
        value = nameValue[1];
        nameValueHash[name] = value;
    }
    return nameValueHash;
};

function Namespace(prefix, uri) {
    this.prefix = prefix;
    this.uri = uri;
}
Namespace.prototype.getElements = function (x, tagName) {
    if (x.getElementsByTagNameNS) {
        return x.getElementsByTagNameNS(this.uri, tagName); // Firefox, Chrome
    } else {
        return x.getElementsByTagName(this.prefix + ":" + tagName); // IE
    }
};
Namespace.prototype.getElement = function (x, tagName) {
    return this.getElements(x, tagName)[0].firstChild;
};
Namespace.prototype.getElementValue = function (x, tagName) {
    return this.getElement(x, tagName).nodeValue;
};

if (window.ActiveXObject) {
   window.XML = function (s) {
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
        xmlDoc.async = false;
        xmlDoc.loadXML(s.replace(/></g, "> <")); // Adding a space makes MSXML prettify the document with tabs.
        if (xmlDoc.parseError.errorCode != 0) {
            alert("(js.js) XML Parse Error: " + xmlDoc.parseError.reason + ", line: " + xmlDoc.parseError.line);
        }
        this.toString = function () {
            return xmlDoc.xml.replace(/\t/g, "  ");
        };
        this.xmlDoc = xmlDoc;
    };
} else if (window.XML) {
    XML.fixFirefox = function (s) {
        return s.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, ""); // Mozilla bug 336551
    };
}


/*
// Test script:
var o = {n: 1, d: new Date, s: "a", f: function () {var a=2}, b: false, o2: {p: 3.14},
         re: /[r]/g, ud: undefined, nu: null, a: [1, 2, "a",[1,2,"a"],{a:"b",c:[3,4,"d"]}]};
*/

// Save these only once so they can't be overwritten.
/*
Object.prototype._toString = Object.prototype.toString;
Array.prototype._toString = Array.prototype.toString;

Object.prototype.startDump = function () {
    function toString (open, close, showProp) {
        return function () {
            var props = [];
            for (var prop in this) {
                if (!this.hasOwnProperty(prop)) break;
                var val = this[prop];
                if (typeof val == "string") {
                    val = '"' + val.replace(/(["\\])/g, "\\$1") + '"'; // Escape " and \
                } else if (val instanceof Date) {
                    val = 'new Date("' + val + '")';
                }
                props.push((showProp ? prop + ": " : "") + val);
            }
            return open + props.join(", ") + close;
        };
    }

    Array.prototype.toString = toString("[", "]", false);
    Object.prototype.toString = toString("{", "}", true);
};

Object.prototype.endDump = function () {
	Object.prototype.toString = Object.prototype._toString;
	Array.prototype.toString = Array.prototype._toString;
};
*/
