// Drag this to the bookmark toolbar:
// javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/addOktaPersonPassword.js";})();

(function () {
    var password = $('[name="profile.secondEmail"]');
    password.prop("type", "password");
    $('[for="' + password.prop("id") + '"]').html("Password");
    $(":submit")[0].onclick = function () {
        var profile = {
            firstName: $("[name='profile.firstName']").val(),
            lastName: $("[name='profile.lastName']").val(),
            login: $("[name='profile.login']").val(),
            email: $("[name='profile.email']").val()
    		};
        var credentials = {password: {value: password.val()}};
        $.ajax({
            type: "POST",
            url: "/api/v1/users",
            data: JSON.stringify({profile: profile, credentials: credentials}),
            contentType: "application/json"
        }).done(function () {alert("ok");});
        return false;
    };
})();
