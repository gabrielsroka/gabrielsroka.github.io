/*
Sample CSV
login,firstName,lastName,email
addgroupJS@okta.com,add,group,addgroup@okta.com

this is "parallel" and fast
*/

(function () {
    console.clear();
    const urlLimit = 600; // calls / minute
    const clockSkew = 2; // seconds
    const delay = 60 * 1000 / (urlLimit - urlLimit / 60 * clockSkew);
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Okta-XsrfToken': document.querySelector('#_xsrfToken').innerText
    };

    const popup = createPopup("Import Users");
    $('<input type="file">')
    .appendTo(popup)
    .change(function () {
        const reader = new FileReader();
        reader.onload = () => parseFile(reader.result);
        reader.readAsText(this.files[0]);
    });

    function parseFile(file) {
        const lineSeparator = /\r\n|\r|\n/;
        const fieldSeparator = ",";

        const lines = file.split(lineSeparator);
        const fields = lines.shift().split(fieldSeparator);
        const fileHeaders = Object.fromEntries(fields.map((val, i) => [val, i])); // Map header name to number.
        
        lines.forEach((line, i) => {
            if (line == '') return;
            const fields = line.split(fieldSeparator);
            const user = {
                profile: {
                    login: fields[fileHeaders.login],
                    firstName: fields[fileHeaders.firstName],
                    lastName: fields[fileHeaders.lastName],
                    email: fields[fileHeaders.email]
                }
            };
            setTimeout(() => {
                popup.html("Importing " + user.profile.login + " (" + (i + 1) + " of " + lines.length + ")");
                fetch('/api/v1/users?activate=false', {
                    method: 'post',
                    body: JSON.stringify(user),
                    headers
                });
            }, i * delay);
        });
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
