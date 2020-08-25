/*
Search Wiki Favorites and Export to CSV or HTML.
It runs in your browser like a browser extension. It scrapes the Wiki HTML and navigates from page to page.

Setup:
Bookmark: Drag this to your bookmarks toolbar, or
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/wikiFavorites.js";})();

Copy this code to the browser console or, if using Chrome, to a Snippet. For example:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "Wiki Favorites".
4. Copy/paste the code from https://gabrielsroka.github.io/getHNFavorites.js
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to the wiki: https://oktawiki.atlassian.net
2. Bookmark: Click the bookmark, or press F12 (Windows) to open DevTools.
3. Run the code. If using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
4. Look for the popup window in the upper-left corner of your browser.
*/

(function () {
    const popup = createPopup('Wiki Favorites');
    const types = {
        csv: {
            header: 'Link',
            filename: 'Wiki favorites',
            totype: a => a // toCSV(a.title, a.link)
        },
        html: {
            header: '<title>Wiki favorites</title><style>body {font-family: sans-serif;}</style><h1>Wiki favorites</h1>',
            filename: 'Wiki-favorites',
            totype: a => `<p>${a.html}` // `<p><a href="${a.link}" target="_blank" rel="noopener">${a.title}</a>`
        }
    };
    const favorites = [];
    popup.innerHTML = 
//         '<button id=exportToCsv data-filetype=csv>Export to CSV</button> ' + 
//         '<button id=exportToHtml data-filetype=html>Export to HTML</button> ' +
        '<button id=sortresults>Sort by Title</button><br><br>' +
        '<input id=query> <button id=search>Search</button><br><br>' + 
        '<div id=results></div>';
//     exportToCsv.onclick = exportToHtml.onclick = async function () {
//         const filetype = this.dataset.filetype;
//         await getFavorites();
//         downloadFile(types[filetype].header, favorites.map(types[filetype].totype), types[filetype].filename, filetype);
//         results.innerHTML = 'Finished exporting.';
//     };
    search.onclick = async function () {
        const re = new RegExp(query.value, 'i');
        await getFavorites();
        const found = favorites.filter(f => f.title.match(re) || f.link.match(re)).map(types.html.totype);
        if (found.length == 0) {
            results.innerHTML = 'not found';
        } else {
            results.innerHTML = found.join('');
        }
    };
    sortresults.onclick = function () {
        favorites.sort((f1, f2) => f1.title.localeCompare(f2.title));
        results.innerHTML = favorites.map(types.html.totype).join('');
    };
    async function getFavorites() {
        if (favorites.length > 0) return;
        var url = `/wiki/users/viewmyfavourites.action?startIndex=0`;
        var page = 1;
        do {
            results.innerHTML = `Fetching page ${page++} ...<br><br>`;
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const tds = doc.querySelectorAll('td');
            if (tds.length == 1 && tds[0].innerText.includes('There are no pages at the moment.')) break;
            tds.forEach(td => {
                const {title, link} = td.querySelectorAll('a')[1];
                favorites.push({html: td.innerHTML, title, link})
            });
            url = doc.querySelector('.aui-nav-next a').href;
        } while (true);
    }

    function createPopup(title) {
        const div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = title + " <a onclick='document.body.removeChild(this.parentNode)' style='cursor: pointer; padding: 4px'>X</a><br><br>";
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
//     function downloadFile(header, lines, filename, filetype) {
//         const a = document.body.appendChild(document.createElement('a'));
//         a.href = URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/' + filetype}));
//         const date = (new Date()).toISOString().replace(/[T:]/g, "-").substr(0, 19);
//         a.download = `${filename}-${date}.${filetype}`;
//         a.click();
//     }
})();
