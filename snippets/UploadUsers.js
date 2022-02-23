(function () {
    console.clear();
    const users = [];
    var now = new Date();
    now = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    for (var i = 0; i < 500; i++) {
        users.push({
            profile: {
                login: `testapie${i}${now}@okta.com`,
                email: "gabriel.sroka+ssr@gmail.com",
                firstName: "First",
                lastName: "Last"
            }
        });
    }
    newUser(0);
    function newUser(i) {
        $.post({
            url: "/api/v1/users?activate=false",
            data: JSON.stringify(users[i]),
            contentType: "application/json"
        }).then(function (user, status, jqXHR) {
            const remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
            console.log(user.id, remaining);
            if (++i < users.length) {
                if (remaining && remaining < 10) {
                    const intervalID = setInterval(() => {
                        console.log("Sleeping...");
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            newUser(i);
                        }
                    }, 1000);
                } else {
                    newUser(i);
                }
            } else {
                console.log("done");
            }
        });
    }
})();
