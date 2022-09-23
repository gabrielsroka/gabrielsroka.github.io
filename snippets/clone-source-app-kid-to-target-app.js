(async function() {
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-Okta-XsrfToken': document.querySelector('#_xsrfToken').innerText
    };

    const appId = getAppId();     // getAppId from URL like how Rockstar does it
    const app = await getApp(appId);

    while (true) { // prompt for target application id
        var targetAppId = prompt("Enter the target application id");
        if (targetAppId) {
            break;
        } else if (targetAppId == "") {
            alert("No value provided");
            return;
        }
    }
    
    postAppKidToTarget(app, targetAppId);     // Clone source app primary kid to target app
    updateTargetAppPrimaryKid(app, targetAppId);     // Switch target app primary kid to source app primary kid

    async function getApp(appId) {
        const url = '/api/v1/apps/' + appId;
        console.log(url);
        const r = await fetch(url);
        console.log(r.ok, r.status);
        const app = await r.json();
        return app
    }

    async function postAppKidToTarget(app, targetAppId) {
        const url = '/api/v1/apps/' + app.id + '/credentials/keys/' + app.credentials.signing.kid + '/clone?targetAid=' + targetAppId;
        console.log(url);
        const r = await fetch(url, {
            method: 'post',
            headers
        });
        console.log(r.ok, r.status);
        const clone = await r.json();
        console.log(clone);
    }

    async function updateTargetAppPrimaryKid(app, targetAppId) {
        const url = '/api/v1/apps/' + targetAppId;
        console.log(url);
        const body = JSON.stringify({
            name: app.name,
            signOnMode: app.signOnMode,
            settings: app.settings,
            credentials: {
                signing: {
                    kid: app.credentials.signing.kid
                }
            }
        });
        const r = await fetch(url, {
            method: 'put',
            headers,
            body
        });
        console.log(r.ok, r.status);
        const update = await r.json();
        console.log(update);
    }

    // from Rockstar https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/rockstar/rockstar.js#L767
    function getAppId() {
        var path = location.pathname;
        var pathparts = path.split('/');
        if (path.match("admin/app") && (pathparts.length == 6 || pathparts.length == 7)) {
            return pathparts[5];
        }
    }
}
)();