(function () {
    maker({
        url: "/api/v1/users",
        data: function () {return {q: this.search, limit: this.limit};}, // Do not use an arrow function for a method -- it breaks `this`.
        limit: 15, // 15 is the max limit when using q.
        comparer: (user1, user2) => (user1.profile.firstName + user1.profile.lastName).localeCompare(user2.profile.firstName + user2.profile.lastName),
        template: user => {
            var creds = user.credentials.provider;
            var logo = creds.type == "LDAP" ? "ldap_sun_one" : creds.type.toLowerCase();
            return `<tr><td><span class='icon icon-24 group-logos-24 logo-${logo}'></span> ${creds.name == "OKTA" ? "Okta" : creds.name}` +
                `<td><a href="/admin/user/profile/view/${user.id}#tab-account">${user.profile.firstName} ${user.profile.lastName}</a>` +
                `<td>${user.profile.login}<br>${user.profile.email}`;
        },
        headers: "<tr><th>Source<th>Person<th>Username & Email"
    });

    $(".preview-mode").remove();
    $("#header").remove();
    $(".outside.data-list-toolbar").remove();
    $(".data-list-sidebar-wrap").remove();
    $(".data-list-pager-alpha").remove();
    $(".data-list-content-wrap")[0].style.width = "100%";

    function maker(object) {
        var searchObjects = _.debounce(function () {
            $.get({
                url: object.url, 
                data: object.data(),
                dataType: object.dataType || "json"
            }).then(function (data) {
                var objects = data;
                var rows = "";
                objects.sort(object.comparer).forEach(o => rows += object.template(o));
                $(".data-list-table").html(`<table class="data-list-table"><thead>${object.headers}</thead>${rows}</table>`);
            });
        }, 400);
        searchObjects();

        $(object.$search || ".data-list .data-list-toolbar")
            .html(`<input type='text' class='text-field-default' placeholder='${object.placeholder || "Search..."}'>`)
            .find("input")
            .keyup(function () {
                if (object.search == this.value || this.value.length < 2) return;
                object.search = this.value;
                searchObjects();
            }
        );
    }
}
)();
