/* 
Import Seeds from CSV

Setup:
Create a Chrome Snippet for JavaScript:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "Import Seeds from CSV".
4. Copy/paste the code.
5. Save (Ctrl+S, Windows).

Usage:
1. Sign in to Okta Admin Console.
2. Run the code. Click the Run button on the bottom right or press Ctrl+Enter (Windows).
3. Look for the popup window in the upper-left corner of your browser.

NOTE: This only uses the first factorProfile. if you have multiple TOTP factors defined, you'll have to hard-code it. see the TODO below.

NOTE: I've seen issues when trying to register a factor for yourself ("invalid sesssion" error). You might need to have another user register it for you.

Sample CSV. Header row is required and case-sensitive. id is required to be user ID:
id,sharedSecret
00ufx7x1nztULNJLY0h7,CBS7MRHW3WJXQRKG
*/

(function () {
    const popup = createPopup("Import Seeds from CSV");
    const users = [];
    const factorProfile = {};
    $.getJSON('/api/v1/org/factors/hotp/profiles')
    .then(profiles => {
        // TODO: it's hard-coded to use the 0th profile. To use a different profile, change the line below from 0, to its index:
        factorProfile.id = profiles[0].id;
        const rows = profiles.map(profile => '<tr><td>' + (profile.id == factorProfile.id ? '✓ ' : '') + profile.name + '<td>' + profile.id).join('');
        $(`<table class=data-list-table><tr><th>Name<th>Factor Profile ID${rows}</table><input type="file">`)
        .appendTo(popup)
        .change(function () {
            const reader = new FileReader();
            reader.onload = () => parseFile(reader.result);
            reader.readAsText(this.files[0]);
        });
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
            const user = {
                id: fields[headers.id],
                factor: {
                    factorType: "token:hotp",
                    provider: "CUSTOM",
                    factorProfileId: factorProfile.id,
                    profile: {
                        sharedSecret: fields[headers.sharedSecret]
                    }
                }
            };
            users.push(user);
        });
        newFactor(0);
    }

    function newFactor(i) {
        popup.html("Importing " + users[i].id + " (" + (i + 1) + " of " + users.length + ")");
        $.post({
            url: "/api/v1/users/" + users[i].id + '/factors?activate=true',
            data: JSON.stringify(users[i].factor),
            contentType: "application/json"
        }).then(function (factor, status, jqXHR) {
            if (++i < users.length) {
                const remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
                if (remaining && remaining <= 10) {
                    popup.html("Sleeping...");
                    const intervalID = setInterval(() => {
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            newFactor(i);
                        }
                    }, 1000);
                } else {
                    newFactor(i);
                }
            } else {
                popup.html("Imported " + users.length + " factors. Done.");
            }
        }).fail(jqXHR => popup.html("Error on line " + (i + 1) + ": " + jqXHR.responseJSON.errorSummary + jqXHR.responseJSON.errorCauses.map(e => e.errorSummary).join('<br>')));
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
