(async function () {
    console.clear();
    const apps = [];
    var total = 0;
    // 35 on smaller orgs, 75 on larger orgs.
    const pageLimit = 75; // 35 works, 36-ish doesn't. concurrent limit is 15, 35, or 75. see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits
    const urlLimit = 500; // - pageLimit ; // 300 or 500
    const fudge = 1500; // since the page calls also take time (2-3 s). 1500 works ok, 2000 doesn't.
    const delay = 60 * 1000 / (urlLimit / pageLimit) - fudge; // ms
    console.log(new Date());
    for await (const {page, links} of getPages('/api/v1/apps?limit=' + pageLimit)) {
        // `pageLimit` apps at a time (really, 1 page at a time)
        page.forEach(async a => {
            const response = await fetch(`/api/v1/apps/${a.id}`); // placeholder in real life /apps/$appId/groups
            const app = await response.json();
            const remaining = response.headers.get('x-rate-limit-remaining');
            const reset = response.headers.get('x-rate-limit-reset');
            console.log('remaining', remaining, ', reset', new Date(reset * 1000));
            apps.push({id: app.id, label: app.label});
        });

        total += page.length;
        if (total > 600) {
            break;
        }

        console.log('sleeping', delay, 'ms');
        if (links.next) await sleep(delay); // This works!
    }
    console.table(apps);

    async function* getPages(url) {
        while (true) {
            const response = await fetch(url);
            const page = await response.json();
            const links = getLinks(response.headers.get('link'));
            yield {page, links};
            if (links.next) {
                const nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                url = nextUrl.pathname + nextUrl.search;
            } else {
                break;
            }
        }
    }

    function getLinks(linkHeader) {
        const headers = linkHeader.split(', ');
        const links = {};
        headers.forEach(header => {
            const [, url, name] = header.match(/<(.*)>; rel="(.*)"/);
            links[name] = url;
        });
        return links;
    }
    async function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
})();
