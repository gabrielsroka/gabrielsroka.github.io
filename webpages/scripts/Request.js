/// <reference path="js.js" />

// Copyright 2008-2012 Gabriel Sroka

function Request(url, data, responseLoaded) {
/// <summary>Wrapper around XMLHttpRequest.</summary>
/// <param name="url" type="String">Where request is sent.</param>
/// <param name="data" type="String">Data sent to server.</param>
/// <param name="responseLoaded" type="Function">Callback function.</param>
/// <returns type="Request">New Request object.</returns>

    // Private instance variables -- see "Private Members in JavaScript" http://javascript.crockford.com/private.html
    var request; // The instance of XMLHttpRequest.
    var _this = this; // Make this available to private [and privileged] methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions.

    var readyState = { // see http://www.w3.org/TR/XMLHttpRequest/#xmlhttprequest
        unsent: 0,
        open: 1,
        sent: 2,
        loading: 3,
        done: 4     // Microsoft's XMLHttpRequest in IE7/8 call it Loaded, see http://msdn.microsoft.com/en-us/library/ms534361
    };

    var status = { // see HTTP 1.1 -- http://tools.ietf.org/html/rfc2616
        ok: 200,
        multiStatus: 207, // WebDAV -- http://tools.ietf.org/html/rfc4918
        notFound: 404
    };

    // Private methods:
    function format(s) {
        if (window.ActiveXObject) {
            s = new XML(s).toString();
        } else if (window.XML) {
            s = new XML(XML.fixFirefox(s)).toString();
        }
        return s;
    }

    if (window.XMLHttpRequest) {
        try {
            request = new XMLHttpRequest(); // see http://www.w3.org/TR/XMLHttpRequest
        } catch (e) {
            request = false;
        }
    } else if (window.ActiveXObject) {
        try {
            request = new ActiveXObject("MSXML2.XMLHTTP"); // see http://msdn.microsoft.com/en-us/library/ms535874
        } catch (e) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                request = false;
            }
        }
    }

    // Privileged methods:
    this.propfind = function (logInfo) {
        function onreadystatechange() {
            if (request.readyState == readyState.done) {
                if ((request.status == status.ok) || (request.status == status.multiStatus)) {
                    if (logInfo) {
                        logInfo("Response status: " + request.status + ", status text: " + request.statusText + "\n");
                        logInfo("Response headers:\n" + request.getAllResponseHeaders());
                        logInfo("Response text:\n" + format(request.responseText));
                    }
                    if (async) {
                        responseLoaded(request.responseXML);
                    } else {
                        return request.responseXML;
                    }
                } else {
                    alert("There was a problem retrieving the data:\n" + request.statusText + " " + request.status);
                }
            }
        }
        if (request) {
            var async = !!responseLoaded;
            if (async) request.onreadystatechange = onreadystatechange;
            request.open("PROPFIND", url, async); // WebDAV -- http://tools.ietf.org/html/rfc4918
            request.setRequestHeader("Depth", "1"); // Depths = ["0", "1", "infinity"]
            request.send(data);
            if (!async) return onreadystatechange();
        }
    };

    this.get = function () {
        function onreadystatechange() {
            if (request.readyState == readyState.done) {
                if (request.status == status.ok) {
                    _this.lastModifiedDate = new Date(request.getResponseHeader("Last-Modified"));
                    responseLoaded(request.responseXML); // Some URLs don't work with responseXML, maybe because of MIME type.
//                    var xml = new XML(request.responseText);
//                    responseLoaded(xml.xmlDoc);
                } else {
                    responseLoaded("There was a problem retrieving the data:\n" + 
                             "statusText: " + request.statusText + "\n" + 
                             "status: " + request.status);
                }
            }
        }
        if (request) {
            request.onreadystatechange = onreadystatechange;
            request.open("GET", url, true);
            request.send(data);
        }
    };
    
    this.getText = function (id) {
        function onreadystatechange() {
            if (request.readyState == readyState.done) {
                if (request.status == status.ok) {
                    responseLoaded(request.responseText, id);
                } else {
                    responseLoaded("Error: " + (request.statusText == "OK" ? "" : (request.statusText + " ")) + 
                                   request.status, id);
                }
            }
        }
        if (request) {
            request.onreadystatechange = onreadystatechange;
            request.open("GET", url, true);
            request.send(data);
        }
    };

    this.post = function () {
        function onreadystatechange() {
            if (request.readyState == readyState.done) {
                if (request.status == status.ok) {
                    responseLoaded(request.responseXML);
                } else {
                    alert("There was a problem retrieving the data:\n" + request.statusText + " " + request.status);
                }
            }
        }
        if (request) {
            request.onreadystatechange = onreadystatechange;
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send(data);
        }
    };

    this.abort = function () {
        request.abort();
    };

    // Public instance variables:
    this.lastModifiedDate = undefined;
}

// Public methods:
// Request.prototype.publicMethod = function () {};
