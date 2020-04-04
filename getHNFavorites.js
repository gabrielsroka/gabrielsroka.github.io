/* 
This bookmarklet exports HN Favorites to CSV.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/getHNFavorites.js";})();

Usage:
1. Navigate your browser to https://news.ycombinator.com
2. Open the dev console (F12).
3. Click the bookmark from your toolbar.
*/

(async function () {
    if (location.host != base) {
        alert('go to ' + base);
        return;
    }

    const id = prompt('User id');
    const lastPage = prompt('Last page');

    const base = 'news.ycombinator.com';
    const url = `https://${base}/favorites?id=${id}&p=`;
    const favorites = [];
    console.clear();
    for (var p = 1; p <= lastPage; p++) {
        console.log('page', p);
        const response = await fetch(url + p);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll('table.itemlist .athing');
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
