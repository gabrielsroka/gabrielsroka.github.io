javascript:
/* 
Bookmarklet name: /Import Users CSV#

Setup:
Drag/drop or copy/paste all of this to your bookmark toolbar. Or:
Create a Chrome Snippet for JavaScript:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "Import Users from CSV".
4. Copy/paste the code.
5. Save (Ctrl+S, Windows).

Usage:
1. Sign in to Okta Admin Console.
2. If using the bookmark, click it. Or, if using a snippet, click the Run button on the bottom right or press Ctrl+Enter (Windows).
3. Look for the popup window in the upper-left corner of your browser.

Example CSV. Header row is required and case-sensitive:
login,firstName,lastName,email,groupIds
addgroupJS@okta.com,add,group,addgroup@okta.com,"00gp70td8aRPYVumf0h7;00gp70td8aRPYVumf0h7"
*/

(function () {
    const popup = createPopup("Import Users");
    const users = [];
    var start;
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
        const headers = {};
        fields.forEach((val, i) => headers[val] = i); /* Map header name to number. */

        lines.forEach(line => {
            if (line == '') return;
            const fields = line.split(fieldSeparator);
            const user = {
                profile: {
                    login: fields[headers.login],
                    firstName: fields[headers.firstName],
                    lastName: fields[headers.lastName],
                    email: fields[headers.email]
                },
                groupIds: fields[headers.groupIds].split(';')
            };
            users.push(user);
        });
        start = Date();
        newUser(0);
    }

    function newUser(i) {
        popup.html("Importing " + users[i].profile.login + " (" + (i + 1) + " of " + users.length + ")");
        $.post({
            url: "/api/v1/users?activate=false",
            data: JSON.stringify(users[i]),
            contentType: "application/json"
        }).then(function (user, status, jqXHR) {
            if (++i < users.length) {
                const remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
                if (remaining && remaining <= 10) {
                    popup.html("Sleeping...");
                    const intervalID = setInterval(() => {
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            newUser(i);
                        }
                    }, 1000);
                } else {
                    newUser(i);
                }
            } else {
                popup.html("Imported " + users.length + " users. Done.<br><br>Start: " + start + "<br>Ended: " + Date());
            }
        }).fail(jqXHR => popup.html("Error on line " + (i + 1) + ": " + jqXHR.responseJSON.errorCauses[0].errorSummary));
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
