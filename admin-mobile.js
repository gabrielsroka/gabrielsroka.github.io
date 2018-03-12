(function () {
    var users = {
        url: "/api/v1/users",
        data: function () {return {q: this.search, limit: this.limit};},
        limit: 8,
        comparer: (user1, user2) => (user1.profile.firstName + user1.profile.lastName).localeCompare(user2.profile.firstName + user2.profile.lastName),
        template: user => {
            var creds = user.credentials.provider;
            var logo = creds.type == "LDAP" ? "ldap_sun_one" : creds.type.toLowerCase();
            return `<tr><td><span class='icon icon-24 group-logos-24 logo-${logo}'></span>` +
                `<td><a href="/admin/user/profile/view/${user.id}#tab-account">${user.profile.firstName} ${user.profile.lastName}</a>` +
                `<td>${user.profile.login}<br>${user.profile.email}`;
        },
        placeholder: "Search Active by First/Last/Email...",
        headers: "<tr><th>Source<th>Person<th>Username & Email"
    };
    var groups = {
        url: "/api/v1/groups",
        data: function () {return {q: this.search, limit: this.limit};},
        limit: 8,
        comparer: (group1, group2) => group1.profile.name.localeCompare(group2.profile.name),
        template: group => {
            var type = group.type == "OKTA_GROUP" ? "okta" : "active_directory";
            return `<tr><td><span class='icon icon-24 group-logos-24 logo-${type}'></span>` +
                `<td><a href="/admin/group/${group.id}">${group.profile.name}</a><br>${group.profile.description || ""}`;
        },
        headers: "<tr><th>Source<th>Name"
    };

    var input;
    maker(users);
    $('<a href="/admin/dashboard"><img src="https://gabrielsroka.github.io/menu.png"></a>').insertAfter("#startcontent");
    $(".preview-mode").hide();
    $("#header").hide();
    $(".outside.data-list-toolbar").hide();
    $(".data-list-sidebar-wrap").hide();
    $(".data-list-toolbar").hide();
    $(".data-list-content-wrap")[0].style.width = "100%";

    function maker(object) {
        var searchObjects = _.debounce(function () {
            $.get({
                url: object.url, 
                data: object.data(),
                dataType: object.dataType || "json"
            }).then(function (objects) {
                var rows = "";
                objects.sort(object.comparer).forEach(o => rows += object.template(o));
                $(".data-list-table").html(`<thead>${object.headers}</thead>${rows}`);
                if (object == users) {
                    $('<tr><td colspan=3><span class="icon group-24"></span><br><br>Groups</td></tr>').appendTo(".data-list-table").click(() => {
                        maker(groups);
                        $(".person-24").removeClass("person-24").addClass("group-24");
                        $("#user-list-page").html($("#user-list-page").html().replace(/People/g, "Groups"));
                    });
                } else {
                    $('<tr><td colspan=2><span class="icon person-24"></span><br><br>People</td></tr>').appendTo(".data-list-table").click(() => {
                        maker(users);
                        $(".group-24").removeClass("group-24").addClass("person-24");
                        $("#user-list-page").html($("#user-list-page").html().replace(/Groups/g, "People"));
                    });
                }
                $('<tr><td colspan=3>Show Menus</td></tr>').appendTo(".data-list-table").click(() => $("#header").toggle());
            });
        }, 400);
        searchObjects();

        if (!input) {
            input = $(`<input type='text' class='text-field-default' style='width: 250px'>`).insertAfter("#startcontent");
        }
        input.attr("placeholder", object.placeholder || "Search...").off("keyup").val(object.search);
        input.keyup(function () {
            if (object.search == this.value || this.value.length < 2) return;
            object.search = this.value;
            searchObjects();
        });
    }
}
)();
