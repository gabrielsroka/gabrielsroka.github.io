(async function () {
    const popup = createPopup('Search 10,000 Groups with Name Containing');
    const form = $('<form>Name <input class=name style="width: 250px"> ' + 
        '<button type=submit disabled>Search</button></form><br><div class=results>Loading...</div>').appendTo(popup);
    form.find('input.name').focus();
    form.submit(event => {
        const re = new RegExp(form.find('input.name').val(), 'i');
        const found = groups
            .filter(group => re.test(group.profile.name))
            .map(group => group.profile.name.link('/admin/group/' + group.id));
        const results = found.length > 0 ? found.join('<br>') : 'Not found';
        popup.find('div.results').html(results);
        event.preventDefault();
    });
    const groups = await $.getJSON('/api/v1/groups');
    popup.find('button').prop('disabled', false);
    popup.find('div.results').html('');

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
})();