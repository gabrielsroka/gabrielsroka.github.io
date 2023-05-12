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
3. Give it a name, eg, "SearchUsers.js".
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

    const popup = createPopup('Search users');
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
    const form = $('<form><select id=attr>' + Object.keys(props).sort().map(n => `<option>${n}`).join('') + '</select> ' +
       'Contains <input class=search style="width: 250px" placeholder="Search"> ' + 
       'Status <select id=searchStatus>' + Object.entries(statuses).map(([n, v]) => `<option value='${n}'>${v}`).join('') + '</select> ' +
       '<button type=submit>Search</button></form><br>' + 
       '<div class=results></div>').appendTo(popup);
    form.find('input.search').focus();
    var users = [];
    var oldSearchStatus = '';
    form.submit(async event => {
        event.preventDefault();
        if (!users.length || oldSearchStatus != searchStatus.value) {
            users = [];
            oldSearchStatus = searchStatus.value;
            popup.find('div.results').html('Loading...');
            for await (const page of getPages('/api/v1/users' + (searchStatus.value ? `?search=status eq "${searchStatus.value}"` : ''))) {
                users = users.concat(page);
                popup.find('div.results').html('Loading... ' + users.length + ' users.');
            }
        }
        users.sort((u1, u2) => 
            ['number', 'integer'].includes(props[attr.value].type) ?
            (u1.profile[attr.value] === undefined ? -1 : u2.profile[attr.value] === undefined ? 1 : u1.profile[attr.value] - u2.profile[attr.value]) : 
            (u1.profile[attr.value] ?? '').localeCompare(u2.profile[attr.value]));
        const re = new RegExp(form.find('input.search').val(), 'i');
        const pre = (p, ...ds) => p + ds.join(p);
        const found = users
            .filter(user => re.test(user.profile[attr.value]))
            .map(user => '<tr>' + pre('<td>', (user.profile.firstName + ' ' + user.profile.lastName).link('/admin/user/profile/view/' + user.id), user.profile.login, user.profile.email, statuses[user.status], user.profile[attr.value]));
        popup.find('div.results')
            .html(found.length + ` user${found.length == 1 ? '' : 's'} found` + 
                (found.length ? `<table class=data-list-table><tr><th>Name<th>Username<th>Email<th>Status<th>${attr.value}` + found.join('') + '</table>' : ''));
    });

    async function* getPages(url) {
        while (url) {
            const r = await fetch(url);
            const page = await r.json();
            yield page;
            url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
        }
    }
    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; ` +
                `overflow: auto; background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/SearchUsers.js' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
})();
