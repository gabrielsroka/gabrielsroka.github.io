javascript:
/* 
bookmarklet name: /ImportGroupsCSV#

Import Groups from CSV

Setup:
Drag and drop all of this to your bookmark toolbar. Or:
Create a Chrome Snippet for JavaScript:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "Import Groups from CSV".
4. Copy/paste the code.
5. Save (Ctrl+S, Windows).

Usage:
1. Sign in to Okta Admin Console.
2. If using the bookmark, click it. Or, if using a snippet, click the Run button on the bottom right or press Ctrl+Enter (Windows).
3. Look for the popup window in the upper-left corner of your browser.

Sample CSV (header row is required, description is optional):
name,description
Group 1,The first group
*/

(function () {
    const popup = createPopup('Import Groups from CSV');
    const groups = [];
    $('<input type="file">')
    .appendTo(popup)
    .change(function () {
        const reader = new FileReader();
        reader.onload = () => parseFile(reader.result);
        reader.readAsText(this.files[0]);
    });

    function parseFile(file) {
        const lineSeparator = /\r\n|\r|\n/;
        const fieldSeparator = ',';

        const lines = file.split(lineSeparator);
        const fields = lines.shift().split(fieldSeparator);
        const headers = {};
        fields.forEach((val, i) => headers[val] = i); /* Map header name to number. */

        lines.forEach(line => {
            if (line == '') return;
            const fields = line.split(fieldSeparator);
            const group = {
                profile: {
                    name: fields[headers.name],
                    description: fields[headers.description]
                }
            };
            groups.push(group);
        });
        newGroup(0);
    }

    function newGroup(i) {
        popup.html('Importing ' + groups[i].profile.name + ' (' + (i + 1) + ' of ' + groups.length + ')');
        $.post({
            url: '/api/v1/groups',
            data: JSON.stringify(groups[i]),
            contentType: 'application/json'
        }).then(function (group, status, jqXHR) {
            if (++i < groups.length) {
                const remaining = jqXHR.getResponseHeader('X-Rate-Limit-Remaining');
                if (remaining && remaining <= 10) {
                    popup.html('Sleeping...');
                    const intervalID = setInterval(() => {
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader('X-Rate-Limit-Reset')) {
                            clearInterval(intervalID);
                            newGroup(i);
                        }
                    }, 1000);
                } else {
                    newGroup(i);
                }
            } else {
                popup.html('Imported ' + groups.length + ' groups. Done.');
            }
        }).fail(jqXHR => popup.html('Error on line ' + (i + 1) + ': ' + jqXHR.responseJSON.errorCauses[0].errorSummary));
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
})();
