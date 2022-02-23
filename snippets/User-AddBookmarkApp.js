(function () {
    var $ = window.$.fn ? window.$ : window.jQueryCourage;
    var div = $(createDiv("Add Bookmark App"));
    div.html("<form><table><tr><td>Label<td><input class=label style='width: 300px'>" + 
        "<tr><td>URL<td><input class=url style='width: 300px'></table>" + 
        "<button type=submit>Add</button></form>");
    div.find("button").click(function () {
        postJson({
            url: "/api/internal/enduser/catalog/bookmark-app",
            data: {
                customAppLoginUrl: div.find("input.url").val(),
                customAppLabel: div.find("input.label").val()
            }
        }).then(function (app) {
            div.html(`${app.customAppLabel} added.`);
        }).fail(jqXHR => div.html(div.html() + "<br>Error: " + jqXHR.responseJSON.errorCauses[0].errorSummary));
        return false; // Cancel form.
    });
    function postJson(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        return $.post(settings);
    }
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)' style='cursor: pointer'>" + title + " - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a><br><br>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        return div.appendChild(document.createElement("div"));
    }
})();
