javascript: 
/*

Bookmark Name: /Clone Policies#

This bookmarklet clones app policies.

Setup:
1. Show your bookmarks toolbar. In Chrome, … > Bookmarks > Show Bookmarks Bar. In Firefox, right-click in the title bar and click Bookmarks Toolbar.
2. Drag all this to the bookmark toolbar

Usage:
1. In Okta Admin, go to Applications > Applications.
2. Select the app whose policy you'd like to clone.
3. Click the bookmark from your toolbar.


TODO:
rate limits - per minute & concurrent
pagination [?]
test on 800 apps (rate limit is 300)
test on OIDC/SAML/OIN/SWA/Bookmark/all kinds o' apps, excluding AD
concurrent limits (different per org)
clone multiple rules
- test priorities of multiple rules

rollback/undo:
- if it fails, do no harm.
- delete all
- when Shareable App is in product, will it migrate?

- add a "deny all" policy.
- [NOPE] don't delete existing policies, post go live cleanup

eng raise rate limit?
- [NOPE] clone deactivated, then button click->activate 
- rpt on current policies, csv
- batch size 100s, AL1, AL2
- search, filter?, import IDs from CSV
- [UI, but prolly NOPE] Security > Profile Enrollment

scale test: 1000 apps * 4 rules/app

NOTE: when u delete an app, it still has a policy !!!

*/

(async function () {
    /* Main popup. */
    const popup = createPopup('Clone Application Policies');
    const form = $('<form>Applications<div class=results>Loading...</div><br> ' +
        '<button type=submit disabled>Clone</button> ' +
        '<input type=button class=checkAll value="Check All"> <input type=button class=uncheckAll value="Uncheck All">' +
        '<br><br><div class=cloned></div></form>').appendTo(popup);
    
    $('<input type="file">')
    .appendTo(popup)
    .change(function () {
        const reader = new FileReader();
        reader.onload = () => parseFile(reader.result);
        reader.readAsText(this.files[0]);
    });

    async function parseFile(file) {
        const lineSeparator = /\r\n|\r|\n/;
        const fieldSeparator = ",";

        const lines = file.split(lineSeparator);
        if (lines[lines.length - 1] == '') lines.pop();
        const fields = lines.shift().split(fieldSeparator);
        const headers = {};
        fields.forEach((val, i) => headers[val] = i); /* Map header name to number. */

        form.find('div.cloned').html('Cloned:<br>');
        const cloned = [];
        for (const line of lines) {
            const fields = line.split(fieldSeparator);
            const policyId = fields[headers.id];
            await postJSON({url: `/api/v1/policies/${policyId}/rules`, data: rule});
            cloned.push(fields[headers.name]);
            if (cloned.length == lines.length) {
                form.find('div.cloned').html(form.find('div.cloned').html() + cloned.sort().join('<br>'));
            }
        }
    }

    /* Find policies and apps, show checkboxes. */
    const appId = getAppId();
    if (!appId) {
        alert('Please pick an app first.');
        form.find('div.results').html('<br>Please pick an app first.');
        return;
    }

    var policyId;
    const found = [];
    const csv = [];
    const policies = await $.getJSON('/api/v1/policies?type=Okta:SignOn');
    for (const p of policies) {
        const app = await $.getJSON(`/api/v1/policies/${p.id}/app`);
        if (app.length) {
            if (app[0].id == appId) {
                policyId = p.id;
            } else {
                const sortBy = `<!--${p.name}-->`;
                found.push(`${sortBy}<label><input type=checkbox value='${p.id}' checked>${p.name}</label>`);
            }
            csv.push(toCSV(p.id, p.name));
        }
    }
    downloadCSV(popup, 'id,name', csv, 'apps');
    const results = found.length > 0 ? found.sort().join('<br>') : 'Not found';
    form.find('div.results').html(results);
    form.find('button').prop('disabled', false);

    /* Find and edit rule. */
    const rules = await $.getJSON(`/api/v1/policies/${policyId}/rules?type=Okta:SignOn`);
    const rule = rules[0];
    rule.name += ' (clone)';
    delete rule.id;
    delete rule.resourceDisplayName;
    delete rule._links;

    /* Clone rule. */
    form.submit(event => {
        form.find('div.cloned').html('Cloned:<br>');
        const checked = form.find('input:checked');
        const cloned = [];
        checked.each(async function () {
            await postJSON({url: `/api/v1/policies/${this.value}/rules`, data: rule});
            cloned.push(this.parentNode.textContent);
            if (cloned.length == checked.length) {
                form.find('div.cloned').html(form.find('div.cloned').html() + cloned.sort().join('<br>'));
            }
        });
        event.preventDefault();
    });

    form.find('input.checkAll').click(() => form.find('input[type="checkbox"]').prop('checked', true));
    form.find('input.uncheckAll').click(() => form.find('input[type="checkbox"]').prop('checked', false));

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
    function toCSV(...fields) {
        return fields.map(field => `"${field == undefined ? "" : field.toString().replace(/"/g, '""')}"`).join(',');
    }
    function downloadCSV(popup, header, lines, filename) {
        var a = $("<a>").appendTo(popup);
        a.attr("href", URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/csv'})));
        var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").slice(0, 19);
        a.attr("download", `${filename} ${date}.csv`);
        a[0].click();
    }
    function getAppId() {
        const path = location.pathname;
        const pathparts = path.split('/');
        if (path.match("admin/app") && (pathparts.length == 6 || pathparts.length == 7)) {
            return pathparts[5];
        }
    }
    function postJSON(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        return $.post(settings);
    }
})();
