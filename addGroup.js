javascript:
/* 
name: /Add Group#
url: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/addGroup.js

Add a new group.

Setup:
Drag this to the bookmark toolbar:

Usage:
1. Login to Okta Admin.
2. Click the bookmark from your toolbar.
*/

(function () {
    var popup = createPopup("Add Group");
    var form = $("<form><table>" +
        "<tr><td>Group Name<td><input class=name style='width: 300px'>" + 
        "<tr><td>Description<td><input class=description style='width: 300px'></table>" + 
        "<button type=submit>Add</button>" +
        "<div class=results></div></form>").appendTo(popup);
    form.submit(async event => {
        event.preventDefault();
        var group = {
            profile: {
                name: form.find("input.name").val(),
                description: form.find("input.description").val()
            }
        };
        form.find('div.results').html("Adding group...");
        /* https://developer.okta.com/docs/api/openapi/okta-management/management/tag/Group/#tag/Group/operation/addGroup */
        try {
            group = await postJson("/api/v1/groups", group);
            form.find('div.results').html(`Added group <a href='/admin/group/${group.id}'>${group.profile.name}</a>.`);
        } catch (error) {
            console.log(error.responseJSON.errorCauses);
            form.find('div.results').html(error.responseJSON.errorCauses.map(c => c.errorSummary));
        }
    });
    async function postJson(url, data) {
        return $.post({url, data: JSON.stringify(data), contentType: "application/json"});
    }
    function createPopup(title) {
        var popup = $(`<div style='position: absolute; z-index: 1000; left: 4px; top: 4px; background-color: white; padding: 8px; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io' target='_blank' rel='noopener'>&nbsp;?&nbsp;</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer'>&nbsp;X&nbsp;</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
})();
