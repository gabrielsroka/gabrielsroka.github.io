javascript:
/* /auth0-listUsers# */
(async function () {
    console.clear();
    let p = 0;
    let total = 0;
    do {
        var r = await fetch('/api/users?include_totals=true&page=' + p++);
        if (!r.ok) break;
        var page = await r.json();
        for (const user of page.users) {
            user.identities = JSON.stringify(user.identities);
            r = await fetch(`/api/users/${user.user_id}/roles`);
            if (!r.ok) break;
            user.roles = await r.text(); /* json(); */
            r = await fetch(`/api/users/${user.user_id}/permissions`);
            if (!r.ok) break;
            user.permissions = await r.text(); /* json(); */
        }
        console.table(page.users);
        total += page.users.length;
    } while (total < page.total);
})();
