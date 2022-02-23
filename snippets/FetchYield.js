(async function () {
    console.clear();
    const users = [];
    var total = 0;
    const pageLimit = 75; // 75-ish works, 76-79-ish doesn't. concurrent limit is 15, 35, or 75. see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits
    const urlLimit = 600 - pageLimit - 5;
    const delay = 60 * 1000 / (urlLimit / pageLimit);
    for await (const page of getPages('/api/v1/users?limit=' + pageLimit)) { //  /?filter=profile.lastName eq "Doe"&limit=2
        // 75 users at a time (really, 1 page at a time)
        page.forEach(async user => {
            const response = await fetch(`/api/v1/users/${user.id}/factors`);
            const factors = await response.json();
            users.push({userId: user.id, factorTypes: factors.map(factor => factor.factorType).join(';')});
        });

        // 1 user at a time
//         for (const user of page) {
//             const response = await fetch(`/api/v1/users/${user.id}/factors`);
//             const factors = await response.json();
//             users.push({userId: user.id, factorTypes: factors.map(factor => factor.factorType).join(';')});
//             console.log(user.id, factors.length);
//         }

        total += page.length;
        console.log('sleeping', delay, 'ms');
        console.log('users', users.length);
        await sleep(delay); // This works!
        
        if (total > 600) {
            break;
        }
    }
    console.table(users);

    async function* getPages(url) {
        do {
            const response = await fetch(url);
            const page = await response.json();
            yield page;
            var links = getLinks(response.headers.get('link'));
            if (links.next) {
                const nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                url = nextUrl.pathname + nextUrl.search;
            }
        } while (links.next);
    }

    function getLinks(linkHeader) {
        const headers = linkHeader.split(", ");
        const links = {};
        headers.forEach(header => {
            const [, url, name] = header.match(/<(.*)>; rel="(.*)"/);
            links[name] = url;
        });
        return links;
    }
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
})();
