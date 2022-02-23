javascript:
/*
Bookmark name: /AddUserDefaultAddr#

This bookmarklet modifies the standard Okta Admin Add Person dialog box to add a default address.

Setup:
1. Drag all this to the bookmark toolbar

Usage:
1. In Okta Admin, go to Directory > People.
2. Click Add Person.
3. Click the bookmark from your toolbar.
4. Fill out the form and click Save.
*/

(function () {
    $(":submit").click(event => {
        event.preventDefault();
        const profile = {
            firstName: $("[name='profile.firstName']").val(),
            lastName: $("[name='profile.lastName']").val(),
            login: $("[name='profile.login']").val(),
            email: $("[name='profile.email']").val(),
            streetAddress: '123 Main St.',
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210',
            countryCode: 'US', /* Short code format */
            postalAddress: 'PO Box 456'
        };
        $.post({
            url: '/api/v1/users',
            data: JSON.stringify({profile}),
            contentType: 'application/json'
        })
        .done(user => alert('New user was added. ' + user.id))
        .fail(jqXHR => alert('Error:\n' + jqXHR.responseJSON.errorCauses.map(e => e.errorSummary).join('\n')));
    });
})();