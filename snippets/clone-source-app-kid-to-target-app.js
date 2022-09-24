(async function() {
    var targetAppId = prompt("Enter the target application id");
    if (targetAppId == "") {
        alert("No value provided");
        return;
    }
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-Okta-XsrfToken': document.querySelector('#_xsrfToken').innerText
    };

    const appId = getAppId();     // getAppId from URL like how Rockstar does it
    const sourceApp = await getApp(appId);
    const targetApp = await getApp(targetAppId)

    postSourceAppKidToTarget(sourceApp, targetApp);     // Clone source app primary kid to target app
    updateTargetAppPrimaryKid(sourceApp, targetApp);     // Switch target app primary kid to source app primary kid

    async function getApp(appId) {
        const url = '/api/v1/apps/' + appId;
        console.log(url);
        const r = await fetch(url);
        console.log(r.ok, r.status);
        const app = await r.json();
        return app
    }

    async function postSourceAppKidToTarget(sourceApp, targetApp) {
        const url = '/api/v1/apps/' + sourceApp.id + '/credentials/keys/' + sourceApp.credentials.signing.kid + '/clone?targetAid=' + targetApp.id;
        console.log(url);
        const r = await fetch(url, {
            method: 'post',
            headers
        });
        console.log(r.ok, r.status);
        const clone = await r.json();
        console.log(clone);
    }

    async function updateTargetAppPrimaryKid(sourceApp, targetApp) {
        const url = '/api/v1/apps/' + targetApp.id;
        console.log(url);
        targetApp.credentials.signing.kid = sourceApp.credentials.signing.kid
        const body = JSON.stringify(targetApp);
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