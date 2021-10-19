javascript:
/*
Setup:
Copy this code to the browser console, or, if using Chrome, to a Snippet. For example:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "SearchGroups.js".
4. Copy/paste the code from https://gabrielsroka.github.io/SearchGroups.js
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to your Okta admin console.
2. Press F12 (Windows) to open DevTools.
3. Run the code. If using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
4. Look for the popup window in the upper-left corner of your browser.
*/

(async function () {
    const popup = createPopup('Search 10,000 Groups with Name Containing');
    const form = $('<form>Name <input class=name style="width: 250px"> ' + 
        '<button type=submit disabled>Search</button></form><br><div class=results>Loading...</div>').appendTo(popup);
    form.find('input.name').focus();
    form.submit(event => {
        event.preventDefault();
        const re = new RegExp(form.find('input.name').val(), 'i');
        const found = groups
            .filter(group => re.test(group.profile.name))
            .map(group => group.profile.name.link('/admin/group/' + group.id));
        const results = found.length > 0 ? found.join('<br>') : 'Not found';
        popup.find('div.results').html(results);
    });
    const groups = await $.getJSON('/api/v1/groups');
    popup.find('button').prop('disabled', false);
    popup.find('div.results').html('');

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/APIExplorer/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
})();
