/* 
This bookmarklet modifies the standard Okta Admin Add Person dialog box to allow you to create a user with a password.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/addOktaPersonPassword.js";})();

Usage:
1. In Okta Admin, go to Directory > People.
2. Click Add Person.
3. Click the bookmark from your toolbar.
4. Fill out the form including the password and click Save.
*/

(function () {
    var password = $('[name="profile.secondEmail"]');
    password.prop("type", "password");
    $('[for="' + password.prop("id") + '"]').html("Password").next().html("");
    $(":submit").click(function () {
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
        }).done(function () {
            alert("New user was added."); // TODO: improve feedback, add second password field to compare with first.
        }).fail(function (jqXHR) {
            var causes = jqXHR.responseJSON.errorCauses;
            var errors = "";
            for (var c = 0; c < causes.length; c++) {
                errors += causes[c].errorSummary + "\n";
            }
            alert("Error:\n" + errors); // TODO: improve error checking
        });
        return false; // Cancel the form.submit.
    });
})();
