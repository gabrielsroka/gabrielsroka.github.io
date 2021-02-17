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


1030-1200

TODO: 
rate limits - per minute & concurrent
pagination [?]
test on 800 apps (rate limit is 300)
test on OIDC/SAML/OIN/SWA/Bookmark/all kinds o' apps
concurrent limits (different per org)
clone multiple rules
rollback

NOTE: when u delete an app, it still has a policy !!!
*/
(async function () {
    /* Main popup. */
    const popup = createPopup('Clone Application Policies');
    const form = $('<form>Applications<div class=results><br>Loading...</div><br><button type=submit disabled>Clone</button>' +
        '<br><br><div class=cloned></div></form>').appendTo(popup);

    /* Find policies and apps, show checkboxes. */
    const policies = await $.getJSON('/api/v1/policies?type=Okta:SignOn');
    const found = [];
    const appId = getAppId();
    if (!appId) {
        alert('Please pick an app first.');
        form.find('div.results').html('<br>Please pick an app first.');
        return;
    }
    var policyId;
    await Promise.all(policies.map(async p => {
/* this is TEMPORARY
        if (p.name.startsWith('z Bookmark App') && p.name > 'z Bookmark App 1') {
            $.ajax({url: `/api/v1/policies/${p.id}`, method: 'DELETE'});
            return;
        }  
*/
        const app = await $.getJSON(`/api/v1/policies/${p.id}/app`);
        if (app.length) {
            if (app[0].id == appId) {
                policyId = p.id;
            } else {
                found.push(`<!--${p.name}--><label><input type=checkbox value='${p.id}' checked>${p.name}</label>`); /* sortable by name */
            }
        }
    }));
    const results = found.length > 0 ? found.sort().join('<br>') : 'Not found';
    form.find('div.results').html(results);
/*     form.find('input[type="checkbox"]').attr('checked', 'checked'); */
    form.find('button').prop('disabled', false);

    /* Find and edit rule. */
    const rules = await $.getJSON(`/api/v1/policies/${policyId}/rules?type=Okta:SignOn`);
    const rule = rules[0];
    rule.name += ' (clone)';
    delete rule.id;
    delete rule.resourceDisplayName;
    delete rule._links;

    /* TODO: sort these */
    /* Clone rule. */
    form.submit(event => {
        form.find('div.cloned').html('Cloned:<br>');
        form.find('input:checked').each(async function () {
            await postJSON({url: `/api/v1/policies/${this.value}/rules`, data: rule});
            form.find('div.cloned').html(form.find('div.cloned').html() + this.parentNode.textContent + '<br>');
        });
        event.preventDefault();
    });

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
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
