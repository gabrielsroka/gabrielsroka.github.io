/* 
Export HN Favorites to CSV.

Setup:
Copy this code to the browser console or, if using Chrome, to a Snippet. For example:
1. Press F12 (Windows) to open Dev Console
2. Go to Sources > Snippets, click New Snippet
3. Give it a name (eg, "Get HN Favorites")
4. Copy/paste the code from https://gabrielsroka.github.io/getHNFavorites.js
5. Save (Ctrl+S, Windows)

Usage:
1. Navigate your browser to https://news.ycombinator.com
2. Open the dev console (F12).
3. Run the code. If using a Snippet, there's a little triangle on the bottom right, or press Ctrl+Enter (Windows)
*/

(async function () {
    const base = 'news.ycombinator.com';
    if (location.host != base) {
        alert('Go to ' + base + ' and then try again.');
        return;
    }

    const id = prompt('User id');

    const url = `https://${base}/favorites?id=${id}&p=`;
    const favorites = [];
    console.clear();
    var p = 1;
    while (true) {
        console.log('page', p);
        const response = await fetch(url + p++);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll('table.itemlist .athing');
        if (rows.length == 0) break;
        rows.forEach(row => {
            const a = row.cells[2].firstElementChild;
            favorites.push(toCSV(a.innerText, a.href));
        });
    }
    downloadCSV('Name,URL', favorites, id + "'s HN favorites");

    function toCSV(...fields) {
        return fields.map(field => `"${field == undefined ? "" : field.toString().replace(/"/g, '""')}"`).join(',');
    }
    function downloadCSV(header, lines, filename) {
        const a = document.body.appendChild(document.createElement('a'));
        a.href = URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/csv'}));
        const date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
        a.download = `${filename} ${date}.csv`;
        a.click();
    }
})();
