javascript:
/*
Bookmark name: /Search Users#
URL: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/SearchUsers.js

Setup:
1. Show your bookmarks toolbar. In Chrome, ... > Bookmarks > Show Bookmarks Bar. In Firefox, right-click in the title bar and click Bookmarks Toolbar.
2. Drag all this to the bookmarks toolbar.

Or, copy/paste this code to the browser console, or, if using Chrome, to a Snippet:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "SearchUsers".
4. Copy/paste this code.
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to your Okta Admin console.
2. Run the code. Click the bookmarklet, or if using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
3. Look for the popup window in the upper-left corner of your browser.
*/
(async function () {
    const r = await fetch('/api/v1/meta/schemas/user/default');
    const schema = await r.json();
    const props = {...schema.definitions.base.properties, ...schema.definitions.custom.properties};

    const popup = createPopup('Search Users');
    const statuses = {
        '': 'All',
        STAGED: 'Staged',
        PROVISIONED: 'Pending user action',
        ACTIVE: 'Active',
        RECOVERY: 'Password reset',
        LOCKED_OUT: 'Locked out',
        PASSWORD_EXPIRED: 'Password expired',
        SUSPENDED: 'Suspended',
        DEPROVISIONED: 'Deactivated'
    };
    const form = $('<form><select id=attr>' + Object.keys(props).sort().map(k => `<option>${k}`).join('') + '</select> ' +
       'Contains <input class=search style="width: 250px" placeholder="Search"> ' + 
       'Status <select id=searchStatus>' + Object.entries(statuses).map(([k, v]) => `<option value='${k}'>${v}`).join('') + '</select> ' +
       '<button type=submit>Search</button></form><br>' + 
       '<div class=results></div>').appendTo(popup);
    form.find('input.search').focus();
    var users = [];
    var oldSearchStatus = '';
    var cancel = false;
    var searching = false;
    form.submit(async event => {
        event.preventDefault();
        if (searching) {
            cancel = true;
            return;
        }
        if (!users.length || oldSearchStatus != searchStatus.value) {
            oldSearchStatus = searchStatus.value;
            users = [];
            popup.find('div.results').html('Loading...');
            searching = true;
            cancel = false;
            form.find('button').html('Cancel');
            for await (const user of getObjects('/api/v1/users' + (searchStatus.value ? `?search=status eq "${searchStatus.value}"` : ''))) {
                user.displayName = user.profile.firstName + ' ' + user.profile.lastName;
                users.push(user);
                popup.find('div.results').html('Loading... ' + users.length + ' users');
                if (cancel) break;
            }
            form.find('button').html('Search');
            searching = false;
        }
        const sortFn = 
            ['number', 'integer', 'boolean'].includes(props[attr.value].type) ?
            (u1, u2) => (u1.profile[attr.value] === undefined ? 1 : u2.profile[attr.value] === undefined ? -1 : u1.profile[attr.value] - u2.profile[attr.value]) : 
            (u1, u2) => (u1.profile[attr.value] ?? '').localeCompare(u2.profile[attr.value]);
        const re = new RegExp(form.find('input.search').val(), 'i');
        const pre = (p, ...ds) => p + ds.join(p);
        const found = users
            .filter(u => re.test(u.profile[attr.value]))
            .sort((u1, u2) => u1.displayName.localeCompare(u2.displayName))
            .sort(sortFn)
            .map(u => '<tr>' + pre('<td>', link('/admin/user/profile/view/' + u.id, u.displayName), u.profile.login, u.profile.email, statuses[u.status], u.profile[attr.value]));
        popup.find('div.results')
            .html(found.length + ` user${found.length == 1 ? '' : 's'} found` + 
                (found.length ? '<table class=data-list-table><tr><th>Name<th>Username<th>Email<th>Status<th>' + attr.value + found.join('') + '</table>' : ''));
    });

    async function* getObjects(url) {
        while (url) {
            const r = await fetch(url);
            const objects = await r.json();
            yield* objects;
            url = r.headers.get('link')?.match('<https://[^/]+([^>]+)>; rel="next"')?.[1];
        }
    }
    function link(url, text) {
        return `<a href="${url}" target=_blank>${text}</a>`;
    }
    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; ` +
                `overflow: auto; background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/SearchUsers.js' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a class=close style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        popup.find('a.close').click(() => popup.remove());
        return $('<div></div>').appendTo(popup);
    }
})();
