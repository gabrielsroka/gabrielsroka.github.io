javascript:
/*
Bookmark name: /Search Groups#
URL: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/SearchGroups.js

Setup:
1. Show your bookmarks toolbar. In Chrome, ... > Bookmarks > Show Bookmarks Bar. In Firefox, right-click in the title bar and click Bookmarks Toolbar.
2. Select all and drag/drop or copy/paste to the bookmark toolbar.

Or, copy this code to the browser console, or, if using Chrome, to a Snippet:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "SearchGroups".
4. Copy/paste this code.
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to your Okta admin console.
2. Press F12 (Windows) to open DevTools.
3. Run the code. Click the bookmarklet, or if using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
4. Look for the popup window in the upper-left corner of your browser.
*/
(async function () {
    const popup = createPopup('Search Group Names using a regex');
    const form = $('<form>Name <input class=name style="width: 250px"> <button type=submit>Search</button></form><br><div class=results>Loading...</div>').appendTo(popup);
    const groups = [];
    for await (const group of getObjects('/api/v1/groups')) {
        groups.push(group);
    }
    form.find('input.name').focus();
    form.submit(event => {
        event.preventDefault();
        const re = new RegExp(form.find('input.name').val(), 'i');
        const found = groups
            .filter(group => re.test(group.profile.name))
            .map(group => group.profile.name.link('/admin/group/' + group.id))
            .join('<br>');
        popup.find('div.results').html(found || 'Not found');
    }).submit();

    async function* getObjects(url) {
        while (url) {
            const r = await fetch(url);
            const objects = await r.json();
            for (const o of objects) yield o;
            url = r.headers.get('link')?.match('<https://[^/]+([^>]+)>; rel="next"')?.[1];
        }
    }
    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; ` +
                `overflow: auto; background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/SearchGroups.js' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a class=close style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        popup.find('a.close').click(() => popup.remove());
        return $('<div></div>').appendTo(popup);
    }
})();
