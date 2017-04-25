// Greasemonkey/IE client for Google Fusion Tables

if (this.GM_xmlhttpRequest) {
    // Greasemonkey can make cross-domain HTTP requests. See http://wiki.greasespot.net/GM_xmlhttpRequest
    var httpRequest = GM_xmlhttpRequest;
} else {
    // IE can make cross-domain HTTP requests if Tools/Internet Options/Security/Custom Level/Miscellaneous/Access data sources across domains is set to Enable or Prompt.
    httpRequest = function (details) {
        var request = new XMLHttpRequest();
        request.open(details.method, details.url, false);
        for (var h in details.headers) {
            request.setRequestHeader(h, details.headers[h]);
        }
        request.send(details.data);
        return request;
    };
}

function request(method, url, headers, data) {
    var request = httpRequest({method: method, url: url, synchronous: true, headers: headers, data: data});
    var response = {status: request.status, text: request.responseText, OK: 200};
    return response;
}

function clientLogin(username, password) {
    var method = "POST";
    var url = "https://www.google.com/accounts/ClientLogin";
    var headers = { "Content-Type": "application/x-www-form-urlencoded" };
    var data = "Email=" + username + "&Passwd=" + password + "&service=fusiontables&accountType=HOSTED_OR_GOOGLE";
    var response = request(method, url, headers, data);
    if (response.status == response.OK) {
        return response.text.match(/Auth=(.*)/)[1];
    }
}

function ClientLoginFTClient(token) {
    this.token = token;
}
ClientLoginFTClient.prototype.query = function (query) {
    var url = "https://fusiontables.googleusercontent.com/fusiontables/api/query?jsonCallback=jsonCallback&encid=true";
    var headers = { "Authorization": "GoogleLogin auth=" + this.token };
    var sql = "sql=" + encodeURIComponent(query);
    if (/^(select|describe|show)/i.test(sql)) {
        var method = "GET";
        url += "&" + sql;
        var data;
    } else {
        method = "POST";
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        data = sql;
    }
    var response = request(method, url, headers, data);
    if (response.status == response.OK) {
        // json = { "table": { "cols": ["<c1>", "<c2>"], "rows": [["<r1c1>", "<r1c2>"], ["<r2c1>", "<r2c2>"]]} }
        var json = response.text.replace(/^jsonCallback\(|\)\n$/g, "");
        return JSON.parse(json).table;
    } else {
        return response.text;
    }
};
