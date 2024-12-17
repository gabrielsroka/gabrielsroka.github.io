(function () {
    const popup = createPopup("Import Apps");
    const apps = [];
    $('<input type="file">')
    .appendTo(popup)
    .change(function () {
        const reader = new FileReader();
        reader.onload = () => parseFile(reader.result);
        reader.readAsText(this.files[0]);
    });

    function parseFile(file) {
        const lineSeparator = /\r\n|\r|\n/;
        const fieldSeparator = ",";

        const lines = file.split(lineSeparator);
        const fields = lines.shift().split(fieldSeparator);
        const headers = Object.fromEntries(fields.map((val, i) => [val, i])); // Map header name to number.

        lines.forEach(line => {
            if (line == '') return;
            const fields = line.split(fieldSeparator);
            const app = {
                label: fields[headers.label],
                settings: {
                    signOn: {
                        loginUrl: fields[headers.loginUrl]
                    }
                },
                signOnMode: "AUTO_LOGIN",
                visibility: {
                    autoSubmitToolbar: false
                }
            };
            apps.push(app);
        });
        newApp(0);
    }

    function newApp(i) {
        popup.html("Importing " + apps[i].label + " (" + (i + 1) + " of " + apps.length + ")");
        $.post({
            url: "/api/v1/apps",
            data: JSON.stringify(apps[i]),
            contentType: "application/json"
        }).then(function (app, status, jqXHR) {
            if (++i < apps.length) {
                const remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
                if (remaining && remaining <= 10) {
                    popup.html("Sleeping...");
                    const intervalID = setInterval(() => {
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            newApp(i);
                        }
                    }, 1000);
                } else {
                    newApp(i);
                }
            } else {
                popup.html("Imported " + apps.length + " apps. Done.");
            }
        }).fail(jqXHR => popup.html("Error on line " + (i + 1) + ": " + jqXHR.responseJSON.errorCauses[0].errorSummary));
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/snippets/ImportAppsFromCSV.js' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a class=close style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        popup.find('a.close').click(() => popup.remove());
        return $("<div></div>").appendTo(popup);
    }
})();

/*
function loadtest() {
    var now = new Date();
    now = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    for (var i = 0; i < 300; i++) {
        apps.push({
            label: `ZZZ apie ${i}${now}`,
            settings: {signOn: {loginUrl: "https://aaatest.oktapreview.com"}},
            signOnMode: "AUTO_LOGIN",
            visibility: {autoSubmitToolbar: false}
        });
    }
}
*/
