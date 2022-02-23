(async function () {
    console.clear();
    for (var p = 1; p <= 6; p++) {
        // https://api.github.com/repos/gabrielsroka/gabrielsroka.github.io/commits?path=rockstar/rockstar.js
        const r = await fetch('https://api.github.com/repositories/42752362/commits?path=%2Frockstar%2Frockstar.js&page=' + p);
        const cs = await r.json();
        cs.forEach(c => console.log(c.commit.message + ',' + new Date(c.commit.author.date).toString()));
    }
})();
