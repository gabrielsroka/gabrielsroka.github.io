// from https://support.realconnections.nl/hc/nl/articles/360000255323-Okta-API-management-security-question-reset

(function () {
    // let's set the answer to today.
    const formatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    const today = formatter.format(new Date());

    const userID = location.pathname.split('/').pop();
    $.post({
        url: "/api/v1/users/" + userID, 
        data: JSON.stringify({
            "credentials": {
                "recovery_question": {
                    "question": "Wat is de datum van vandaag?",
                    "answer": today
                }
            }
        }),
        contentType: "application/json"
    }).then(() => {
        console.log('succesvol, de nieuwe security question is:');
        console.log('Wat is de datum van vandaag?');
        console.log(today);
    });
})();
