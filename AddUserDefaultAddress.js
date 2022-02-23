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
    const streetAddress = '123 Main St.';
    const city = 'Anytown';
    const state = 'CA';
    const zipCode = '90210';
    const countryCode = 'US'; /* Short code format */
    const postalAddress = 'PO Box 456';

    const result = document.querySelector('.o-form-error-container');
    result.innerHTML = `Default address: ${streetAddress}<br><br>`;
    document.querySelector('input[type="submit"]').onclick = async event => {
        event.preventDefault();
        const profile = {
            firstName: document.querySelector("[name='profile.firstName']").value,
            lastName: document.querySelector("[name='profile.lastName']").value,
            login: document.querySelector("[name='profile.login']").value,
            email: document.querySelector("[name='profile.email']").value,
            streetAddress,
            city,
            state,
            zipCode,
            countryCode,
            postalAddress
        };
        const response = await fetch('/api/v1/users', {
            method: 'post',
            body: JSON.stringify({profile}),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Okta-XsrfToken': document.querySelector('#_xsrfToken').innerText
            }
        });
        if (response.ok) {
            const user = await response.json();
            result.innerHTML = `Added <a href='/admin/user/profile/view/${user.id}' target='_blank' rel='noopener'>` +
                `${user.profile.firstName} ${user.profile.lastName}</a><br><br>`;
        } else {
            const err = await response.json();
            result.innerHTML = 'Error:<br>' + err.errorCauses.map(e => e.errorSummary).join('<br>') + '<br><br>';
        }
    };
})();
