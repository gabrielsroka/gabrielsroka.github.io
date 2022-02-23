// This seems to work. (works)
(function () {
    console.clear();
    var headers;

    fetch('/api/v1/users') // ?filter=status eq "ACTIVE"' or  ?search=(status lt "STAGED" or status gt "STAGED") and (status lt "DEPROVISIONED" or status gt "DEPROVISIONED")')
    .then(response => {
        headers = response.headers;
        return response.json();
    })
    .then(getObjects);

    async function getObjects(objects) {
        for (let i = 0; i < objects.length; i++) {
            var response = await fetch("/api/v1/users/" + objects[i].id + "/factors");
            var childHeaders = response.headers;
            var factors = await response.json();
            var remaining = childHeaders.get("X-Rate-Limit-Remaining");
            if (remaining && remaining < 10) {
                do {
                    console.log("child sleeping...", Date());
                    await sleep(1000);
                } while((new Date()).getTime() / 1000 < childHeaders.get("X-Rate-Limit-Reset"));
            }
        }
        var links = getLinks(headers.get("Link"));
        if (links.next) {
            var nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
            var url = nextUrl.pathname + nextUrl.search;
            var remaining = headers.get("X-Rate-Limit-Remaining");
            if (remaining && remaining < 10) {
                do {
                    console.log("main sleeping...", Date());
                    await sleep(1000);
                } while((new Date()).getTime() / 1000 < headers.get("X-Rate-Limit-Reset"));
            }
            var response = await fetch(url);
            headers = response.headers;
            objects = await response.json();
            getObjects(objects);
        }
    }

    function getLinks(linkHeader) {
        var headers = linkHeader.split(", ");
        var links = {};
        for (var i = 0; i < headers.length; i++) {
            var [, url, name] = headers[i].match(/<(.*)>; rel="(.*)"/);
            links[name] = url;
        }
        return links;
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
// does not work
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
// does not work
[0, 1, 2, 3].forEach(async i => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(i);
});
*/

/*
// does not work
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