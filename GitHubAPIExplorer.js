/* 
Explore the GitHub API.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/GitHubAPIExplorer.js";})(); //GitHub API Explorer

Usage:
1. Go to https://developer.github.com
2. Click the GitHub bookmark from your toolbar.
*/

(function () {
    apiExplorer("GET,POST,PATCH,PUT,DELETE", "https://api.github.com", "/users,/users/${username},/users/${username}/followers,/users/${username}/following,/users/${username}/repos");
    
    function apiExplorer(methods, prefix, urls) {
        var apiPopup = createPopup("API Explorer");
        var form = apiPopup[0].appendChild(document.createElement("form"));
        form.innerHTML = "<select id=method>" + methods.split(",").map(method => '<option>' + method).join("") + "</select> " +
            "<input id=url list=apilist> "; // HACK: input.list is read-only, must set it at create time. :(
        url.style.width = "700px";
        url.placeholder = "URL";
        url.focus();
        var datalist = form.appendChild(document.createElement("datalist"));
        datalist.id = "apilist";
        datalist.innerHTML = urls.split(',').map(url => '<option>' + prefix + url).join("");
        var send = form.appendChild(document.createElement("input"));
        send.type = "submit";
        send.value = "Send";
        form.appendChild(document.createElement("div")).innerHTML = "<br>Body";
        var data = form.appendChild(document.createElement("textarea"));
        data.style.width = "850px";
        var results = form.appendChild(document.createElement("div"));
        form.onsubmit = function () {
            $(results).html("<br>Loading ...");
            var url = form.url.value;
            if (url.match(/\${.*}/)) {
                var parts = location.pathname.split('/');
                var id = parts[1];
                url = url.replace(/\${.*}/, id);
            }
            $.ajax({url, method: method.value, data: data.value, contentType: "application/json"})
            .then(function (objects, status, jqXHR) {
                $(results).html("<br>");
                var linkHeader = jqXHR.getResponseHeader("Link"); // TODO: maybe show X-Rate-Limit-* headers, too.
                if (linkHeader) {
                    $(results).html("<br>Headers<br><table><tr><td>Link<td>" + linkHeader.replace(/</g, "&lt;").replace(/, /g, "<br>") + "</table><br>");
                    var links = getLinks(linkHeader);
                }
                $(results).append("Status: " + jqXHR.status + " " + jqXHR.statusText + "<br>");
                var pathname = url.split('?')[0];
                var json = formatPre(linkify(JSON.stringify(objects, null, 4)), pathname); // Pretty Print the JSON.
                if (Array.isArray(objects)) {
                    var table = formatObjects(objects, pathname);
                    $(results).append(table.header);
                    if (links && links.next) {
                        createA("Next >", results, () => {
                            form.url.value = links.next;
                            send.click();
                        });
                    }
                    json = "<br>" + table.body + json;
                }
                $(results).append(json);
            }).fail(jqXHR => $(results).html("<br>Status: " + jqXHR.status + " " + jqXHR.statusText + "<br><br>Error:<pre>" + jqXHR.responseText + "</pre>"));
            return false; // Cancel form submit.
        };
    }

    function formatObjects(objects, url) {
        let len = "(length: " + objects.length + ")\n\n";
        let rows = [];
        let ths = [];
        objects.forEach(row => {
            for (let p in row) {
                if (!ths.includes(p)) ths.push(p);
            }
        });
        objects.forEach(row => {
            let tds = [];
            for (let p of ths) {
                if (row[p] === undefined) row[p] = "";
                if (p == "id") row[p] = "<a href='" + url + "/" + row[p] + "'>" + row[p] + "</a>";
                tds.push("<td>" + (typeof row[p] == "object" ? "<pre>" + JSON.stringify(row[p], null, 4) + "</pre>" : row[p]));
            }
            rows.push("<tr>" + tds.join(""));
        });
        return {header: "<span id=table><b>Table</b> <a href=#json>JSON</a><br><br>" + len + "</span>",
            body: "<br><table class='data-list-table' style='border: 1px solid #ddd;'><tr><th>" + ths.join("<th>") + linkify(rows.join("")) + "</table><br>" +
                "<div id=json><a href=#table>Table</a> <b>JSON</b></div><br>" + len};
    }
    function formatPre(s, url) {
        return "<pre>" + s.replace(/"id": "(.*)"/g, '"id": "<a href="' + url + '/$1">$1</a>"') + "</pre>";
    }
    function linkify(s) {
        return s.replace(/"(https.*)"/g, '"<a href="$1">$1</a>"');
    }

    // Util functions
    function createPopup(title) {
        var popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a class='closePopup' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        popup.find(".closePopup").click(function () {document.body.removeChild(this.parentNode.parentNode)});
        return $("<div></div>").appendTo(popup);
    }
    function createA(html, parent, clickHandler) {
        createPrefixA("", html, parent, clickHandler);
    }
    function createPrefixA(prefix, html, parent, clickHandler) {
        $(`${prefix}<a style='cursor: pointer'>${html}</a>`).appendTo(parent).click(clickHandler);
    }
    function getLinks(linkHeader) {
        var headers = linkHeader.split(", ");
        var links = {};
        for (var i = 0; i < headers.length; i++) {
            var [, url, name] = headers[i].match(/<(.*)>; rel="(.*)"/);
            links[name] = url;
        }
        return links;
    }
})();
