javascript:
/*
name: /Show Linked Objects#
url: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/snippets/ShowLinkedObjects.js
*/
(async function () {
    const los = await getJson('/api/v1/meta/schemas/user/linkedObjects');
    for (const lo of los) {
        getLink(lo.primary);
        getLink(lo.associated);
    }
    async function getLink(lo) {
        const div = document.querySelector('.linkedobject-form').appendChild(document.createElement('div'));
        div.innerHTML = lo.title + '<br>Loading...<br><br>';
        const userId = location.pathname.split('/').pop();
        const links = await getJson(`/api/v1/users/${userId}/linkedObjects/${lo.name}`);
    
        const rows = await Promise.all(links.map(async link => {
            const user = await getJson(new URL(link._links.self.href).pathname);
            return `${user.profile.firstName} ${user.profile.lastName} (${user.profile.email})`.link(`/admin/user/profile/view/${user.id}`);
        }));
        div.innerHTML = lo.title + '<br>' + (rows.length ? rows.sort().join('<br>') : '(none)') + '<br><br>';
    }
    async function getJson(url) {
        const r = await fetch(url);
        return r.json();
    }
})();
