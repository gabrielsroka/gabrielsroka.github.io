(function () {
    console.clear();
    getKeys("/api/v1/org/factors/yubikey_token/tokens?expand=user&limit=1");
    function getKeys(url) {
        $.getJSON(url)
        .then((tokens, status, jqXHR) => {
            tokens.forEach(token => {
                const user = token._embedded && token._embedded.user;
                if (user) {
                    console.log(token.profile.serial, token._embedded && token._embedded.user.id, token._embedded && token._embedded.user.profile.firstName, token._embedded && token._embedded.user.profile.lastName);
                } else {
                    console.log(token.profile.serial);
                }
            });
            const linkHeader = jqXHR.getResponseHeader("Link");
            if (linkHeader) {
                const link = getLinks(linkHeader);
                if (link.next) {
                    var nextUrl = new URL(link.next); // link.next is an absolute URL; we need a relative URL.
                    getKeys(nextUrl.pathname + nextUrl.search);
                }
            }
        });
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
})();
