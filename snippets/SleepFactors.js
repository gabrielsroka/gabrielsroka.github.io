// This seems to work. (works)
(async function () {
    console.clear();

    // ?limit=2&filter=profile.lastName eq "Doe"
    // ?filter=status eq "ACTIVE"' or  ?search=(status lt "STAGED" or status gt "STAGED") and (status lt "DEPROVISIONED" or status gt "DEPROVISIONED")')
    var url = '/api/v1/users';
    while (url) {
        const r = await fetch(url);
        const users = await r.json();
        
        for (const user of users) {
            const response = await fetch(`/api/v1/users/${user.id}/factors`);
            const factors = await response.json();
            const remaining = response.headers.get('X-Rate-Limit-Remaining');
            if (remaining && remaining < 10) {
                do {
                    console.log('child sleeping...', Date());
                    await sleep(1000);
                } while ((new Date()).getTime() / 1000 < response.headers.get('X-Rate-Limit-Reset'));
            }
        }
        url = r.headers.get('link')?.match('<https://[^/]+([^>]+)>; rel="next"')?.[1];
        if (url) {
            const remaining = r.headers.get('X-Rate-Limit-Remaining');
            if (remaining && remaining < 10) {
                do {
                    console.log('main sleeping...', Date());
                    await sleep(1000);
                } while ((new Date()).getTime() / 1000 < r.headers.get('X-Rate-Limit-Reset'));
            }
        }
    }
    
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
})();

/*
// This seems to work.
(async function () {
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    console.clear();
    for (var i = 0; i <= 3; i++) {
        await sleep(1000);
        console.log(i);
    }
})();

(async function () {
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    for (const i of [0, 1, 2, 3]) {
        await sleep(1000);
        console.log(i);
    }
})();

(function () {
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    console.clear();
    var i = 0;
    sleep(1000)
    .then(() => console.log(i++))
    .then(() => sleep(1000))
    .then(() => console.log(i++));
})();
*/

/*
// does not work (needs await)
(function () {
    function sleep(i, time) {
        return new Promise(resolve => setTimeout(function () {resolve(i)}, time));
    }
    console.clear();
    for (var i = 0; i <= 3; i++) {
        sleep(i, 1000).then(i => console.log(i));
    }
})();
*/

/*
// does not work (needs await)
(function () {
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    console.clear();
    for (let i = 0; i < 3; i++) {
        sleep(1000).then(() => console.log(i));
    }
})();
*/

/*
// does not work (since the async => inside the forEach is `await`ed, but we'd want the "outside" to await)
[0, 1, 2, 3].forEach(async i => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(i);
});
*/

/*
// does not work
[0, 1, 2, 3].forEach(i => {
//    console.log(i);
    setTimeout(() => console.log(i), 1000);
});
*/

/*
// doesn't work
for (const i of [0, 1, 2, 3]) {
    const t = setTimeout(() => console.log(i), 1000);
}
*/
