javascript:
/* name: /Show Linked Objects# */
(async function () {
    const r = await fetch('/api/v1/meta/schemas/user/linkedObjects');
    const os = await r.json();
    for (const o of os) {
        getLink(o.primary);
        getLink(o.associated);
    }
    async function getLink(o) {
        const name = o.name;
        const div = document.querySelector('.linkedobject-form').appendChild(document.createElement('div'));
        div.innerHTML = o.title + '<br>Loading...<br><br>';
        const userId = location.pathname.split('/').pop();
        const r = await fetch(`/api/v1/users/${userId}/linkedObjects/${name}`);
        const links = await r.json();
    
        const rows = await Promise.all(links.map(async link => {
            const url = new URL(link._links.self.href).pathname;
            const r = await fetch(url);
            const user = await r.json();
            return `${user.profile.firstName} ${user.profile.lastName} (${user.profile.email})`.link(`/admin/user/profile/view/${user.id}`);
        }));
        div.innerHTML = o.title + '<br>' + rows.sort().join('<br>') + '<br><br>';
    }
})();
