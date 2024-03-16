javascript:
/*
Bookmark name: /Update Users#

Setup:
1. Show your bookmarks toolbar. In Chrome, ... > Bookmarks > Show Bookmarks Bar. In Firefox/IE, right-click in the title bar and click Bookmarks Toolbar.
2. Drag all this to the bookmark toolbar to create a Bookmarklet.

Or, copy/paste this code to the browser Console, or, if using Chrome, to a Snippet:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "UpdateUsers.js".
4. Copy/paste this code.
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to your Okta admin console.
2. Run the code. Click the Bookmarklet, or if using a Snippet, Press F12 (Windows) to open DevTools, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
3. Look for the popup window in the upper-left corner of your browser.

Sample CSV. Header row is required and case-sensitive:
id,login,email
00u14w0...,addgroupJS@okta.com,addgroup@okta.com
*/
(function () {
    const popup = createPopup("Update Users");
    const users = [];
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
                id: fields[headers.id],
                profile: {
                    login: fields[headers.login],
                    email: fields[headers.email]
                }
            };
            users.push(user);
        });
        updateUser(0);
    }

    function updateUser(i) {
        popup.html("Updating " + users[i].profile.login + " (" + (i + 1) + " of " + users.length + ")");
        $.post({
            url: `/api/v1/users/${users[i].id}`,
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
                            updateUser(i);
                        }
                    }, 1000);
                } else {
                    updateUser(i);
                }
            } else {
                popup.html("Updated " + users.length + " users. Done.");
            }
        }).fail(jqXHR => popup.html("Error on line " + (i + 1) + ": " + jqXHR.responseJSON.errorCauses[0].errorSummary));
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a target='_blank' href='https://gabrielsroka.github.io/rockstar/' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
