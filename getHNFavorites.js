/* 
Export HN Favorites to CSV or HTML.
It runs in your browser like a browser extension. It scrapes the HTML and navigates from page to page.

Setup:
Copy this code to the browser console or, if using Chrome, to a Snippet. For example:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "Export HN Favorites".
4. Copy/paste the code from https://gabrielsroka.github.io/getHNFavorites.js
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to https://news.ycombinator.com/user?id=YOUR_USER_ID
2. Press F12 (Windows) to open DevTools.
3. Run the code. If using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
4. Look for the popup window in the upper-left corner of your browser.
*/

(function () {
    const popup = createPopup('HN Favorites');
    const base = 'news.ycombinator.com';
    if (location.host != base || location.pathname != '/user') {
        popup.innerHTML = 'ERROR: Go to your user page and then try again.';
        return;
    }
    const id = location.search.split('=')[1];
    const toCsv = a => favorites.push(toCSV(a.innerText, a.href));
    const toHtml = a => favorites.push(`<p><a href="${a.href}">${a.innerText}</a>`);
    const favorites = [];
    popup.innerHTML = 
        '<button id=exportToCsv data-filetype=csv>Export to CSV</button><br><br>' + 
        '<button id=exportToHtml data-filetype=html>Export to HTML</button><br><br>' +
        '<input id=query> <button id=search>Search</button>';
    exportToCsv.onclick = exportToHtml.onclick = async function () {
        const filetype = this.dataset.filetype;
        if (filetype == 'csv') {
            var header = 'Title,URL';
            var filename = id + "'s HN favorites";
            var totype = toCsv;
        } else if (filetype == 'html') {
            header = '<title>' + id + "'s HN favorites</title><h1>" + id + "'s HN favorites</h1>";
            filename = id + "'s-HN-favorites";
            totype = toHtml;
        }
        await getFavorites(totype);
        downloadFile(header, favorites, filename, filetype);
        popup.innerHTML = 'Done.';
    };
    search.onclick = async function (totype) {
        const re = new RegExp(query.value, 'i');
        await getFavorites(toHtml);
        popup.innerHTML = favorites.filter(f => f.match(re)).join('');
    };
    async function getFavorites(totype) {
        const url = `https://${base}/favorites?id=${id}&p=`;
        for (var p = 1; true; p++) {
            popup.innerHTML = 'Fetching page ' + p + '...<br><br>';
            const response = await fetch(url + p);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            doc.querySelectorAll('a.storylink').forEach(totype);
            if (doc.querySelector('a.morelink') == null) break;
        }
    }

    function createPopup(title) {
        const div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = title + "<a onclick='document.body.removeChild(this.parentNode)' style='cursor: pointer; padding: 4px'>X</a><br><br>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.border = '1px solid #ddd';
        return div.appendChild(document.createElement("div"));
    }
    function toCSV(...fields) {
        return fields.map(field => `"${field == undefined ? "" : field.toString().replace(/"/g, '""')}"`).join(',');
    }
    function downloadFile(header, lines, filename, filetype) {
        const a = document.body.appendChild(document.createElement('a'));
        a.href = URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/' + filetype}));
        const date = (new Date()).toISOString().replace(/[T:]/g, "-").substr(0, 19);
        a.download = `${filename}-${date}.${filetype}`;
        a.click();
    }
})();
