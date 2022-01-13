(async function () {
    console.clear();
    const users = [];
    var total = 0;
    const pageLimit = 75; // 75 works, > 75 doesn't. concurrent limit is 15, 35, or 75. see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits
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
        
//         if (total > 600) {
//             console.table(users);
//             break;
//         }

        await sleep(delay); // This works!
    }

    async function* getPages(url) {
        while (url) {
            const response = await fetch(url);
            const page = await response.json();
            yield page;
            url = getNextUrl(response.headers.get('link'));
        }
    }
    function getNextUrl(linkHeader) {
        const nextLink = linkHeader.split(', ').find(ln => ln.match('rel="next"'));
        if (nextLink) {
            const [, url] = nextLink.match(/<(.*)>/);
            const nextUrl = new URL(url); // url is an absolute URL; we need a relative URL.
            return nextUrl.pathname + nextUrl.search;
        }
    }
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
})();
