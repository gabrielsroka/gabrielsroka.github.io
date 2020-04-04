/* 
Export HN Favorites to CSV.

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
    const form = popup.appendChild(document.createElement('form'));
    form.innerHTML = '<button>Export</button>';
    form.onsubmit = async function (event) {
        event.preventDefault();
        const base = 'news.ycombinator.com';
        if (location.host != base || location.pathname != '/user') {
            popup.innerHTML = 'ERROR: Go to your user page and then try again.';
            return;
        }

        const id = location.search.split('=')[1];
        const url = `https://${base}/favorites?id=${id}&p=`;
        
        const favorites = [];
        var p = 1;
        while (true) {
            popup.innerHTML = 'Exporting page ' + p + '...<br><br>';
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
        popup.innerHTML = 'Done.';
        downloadCSV('Name,URL', favorites, id + "'s HN favorites");
    };


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
    function downloadCSV(header, lines, filename) {
        const a = document.body.appendChild(document.createElement('a'));
        a.href = URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/csv'}));
        const date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
        a.download = `${filename} ${date}.csv`;
        a.click();
    }
})();
