setInterval(function () {
    const fromDomain = "users.domain.org";
    const toDomain = "domain.com";
    const login = $("input[name='profile.login']");
    const secondEmail = $("input[name='profile.secondEmail']");
    login.on("input", function () {
        secondEmail.val(login.val().replace(fromDomain, toDomain)).change();
    });
}, 1000);
