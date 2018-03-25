(function () {
    // What does rockstar do?
    // People page: enhanced search, Export Users menu
    // Person page: show login/email and AD info, show user detail, enhance menus/title, manage user's admin roles
    // Administrators page: export
    // Export Objects to CSV: eg, Users, Groups, Directory Users, App Users, App Groups, Apps, ...
    // User home page: Show SSO (SAML assertion, etc)
    // SU Orgs & Org Users: enhanced search
    // Many: enhanced menus
    // and more to come...
    
    // TODO: Save search string in # in URL. Reload from there.

    var results;

    if (location.host.match(/-admin/)) { // admin pages
        results = createDiv("rockstar");
        if (location.pathname == "/admin/users") {
            directoryPeople();
        } else if (location.pathname.match("/admin/user/")) {
            directoryPerson();
        } else if (location.pathname == "/admin/access/admins") {
            securityAdministrators();
        }
        
        $("<li><a href='/admin/apps/add-app'>Integration Network</a>").appendTo("#nav-admin-apps-2");
        $("<li><a href='/report/system_log'>System Log v1</a>").appendTo("#nav-admin-reports-2");
        $("<li><a style='cursor: pointer'>Export Objects</a>").click(exportObjects).appendTo("#nav-admin-reports-2");
        createA("Export Objects").onclick = exportObjects;
    } else if (location.pathname == "/app/UserHome") { // User home page (non-admin)
        results = createDiv("rockstar");
        userHome();
    } else { // SU
        // Don't show results div.
        if (location.pathname == "/su/orgs") {
            suOrgs();
        } else if (location.pathname.match("/su/org/")) {
            suOrgUsers();
        }
    }

    function directoryPeople() {
        $("<li class=option><a><span class='icon download-16'></span>Export Users</a>").click(exportObjects).appendTo(".okta-dropdown-list");
        searcher({
            url: "/api/v1/users",
            data: function () {return {q: this.search, limit: this.limit};},
            limit: 15, // 15 is the max limit when using q.
            comparer: (user1, user2) => (user1.profile.firstName + user1.profile.lastName).localeCompare(user2.profile.firstName + user2.profile.lastName),
            template: user => {
                var creds = user.credentials.provider;
                var logo = creds.type == "LDAP" ? "ldap_sun_one" : creds.type.toLowerCase();
                return `<tr><td><span class='icon icon-24 group-logos-24 logo-${logo}'></span> ${creds.name == "OKTA" ? "Okta" : creds.name}` +
                    `<td><a href="/admin/user/profile/view/${user.id}#tab-account">${user.profile.firstName} ${user.profile.lastName}</a>` +
                    `<td>${user.profile.login}<td>${user.profile.email}`;
            },
            headers: "<tr><th>Source<th>Name<th>Username<th>Primary Email",
            placeholder: "Search Active by First/Last/Email...",
            empty: true
        });
    }
    function directoryPerson() {
        var userId = location.pathname.split("/")[5];
        var user;
        $.getJSON(`/api/v1/users/${userId}`).then(aUser => {
            user = aUser;
            var ad = user.credentials.provider.type == "ACTIVE_DIRECTORY";
            $(".subheader").html(user.profile.login + ", mail: " + user.profile.email + (ad ? ", " : ""));
            document.title += ` - ${user.profile.firstName} ${user.profile.lastName}`;
            if (ad) {
                function showADs() {
                    $.getJSON(`/api/v1/apps?filter=user.id+eq+"${userId}"&expand=user/${userId}&limit=200&q=active_directory`).then(appUsers => {
                        var results = createDiv("ADs");
                        var rows = "<tr><th>AD Domain<th>Username<th>Email";
                        appUsers.forEach(appUser => {
                            var user = appUser._embedded.user;
                            rows += `<tr><td>${appUser.label}<td>${user.credentials.userName}<td>${user.profile.email}`;
                        });
                        results.innerHTML = "<table class='data-list-table' style='border: 1px solid #ddd;'>" + rows + "</table>";
                    });
                }
                $("<a style='cursor: pointer'>").html("AD: " + user.credentials.provider.name).click(showADs).appendTo(".subheader");
                $("<li class=option><a><span class='icon directory-16'></span>Show ADs</a>").click(showADs).appendTo(".okta-dropdown-list");
            }
        });
        function showUser() {
            function toString(o, i) {
                var strings = [], v, i = i || "";
                for (var p in o) {
                    if (p != "credentials" && p != "_links") {
                        if (o[p] === null) v = "null";
                        else if (typeof o[p] == "string") v = o[p].replace(/(["\\])/g, "\\$1"); // Escape " and \ 
                        else if (o[p] instanceof Array) v = "[" + o[p].toString() + "]";
                        else if (typeof o[p] == "object") v = "{\n" + toString(o[p], i + "\t") + i + "}";
                        else v = o[p];
                        strings.push(i + p + ": " + v);
                    }
                }
                return strings.join("\n") + "\n";
            }
            var results = createDiv("User");
            results.innerHTML = "<span class='icon icon-24 group-logos-24 logo-" + user.credentials.provider.type.toLowerCase() + "'></span><pre>" + toString(user) + "</pre>";
        }
        createA("Show User").onclick = showUser;
        $("<li class=option><a><span class='icon person-16-gray'></span>Show User</a>").click(showUser).appendTo(".okta-dropdown-list");
        
        createA("Administrator Roles").onclick = function () {
            var allRoles = [
                {type: "SUPER_ADMIN", label: "Super"},
                {type: "ORG_ADMIN", label: "Organization"},
                {type: "APP_ADMIN", label: "Application"},
                {type: "USER_ADMIN", label: "Group"}, // not "User"
                {type: "HELP_DESK_ADMIN", label: "Help Desk"},
                {type: "READ_ONLY_ADMIN", label: "Read-only"}, // not "Read Only"
                {type: "MOBILE_ADMIN", label: "Mobile"}
                // {type: "API_ACCESS_MANAGEMENT_ADMIN", label: "API Access Management"} // API AM doesn't show up when you GET.
            ];
            results = createDiv("Administrator Roles"); // don't var, TODO: fixme
            showRoles();
            function showRoles() {
                $.getJSON(`/api/v1/users/${userId}/roles`).then(roles => {
                    if (roles.length == 0) {
                        results.innerHTML = "This user is not an admin.<br><br>";
                        allRoles.forEach(role => {
                            createA(`Grant ${role.label} Administrator`).onclick = function () {
                                var data = {
                                    type: role.type
                                };
                                // https://developer.okta.com/docs/api/resources/roles#assign-role-to-user
                                postJson({
                                    url: `/api/v1/users/${userId}/roles`,
                                    data
                                }).then(() => setTimeout(showRoles, 1000));
                            };
                        });
                    } else {
                        results.innerHTML = "";
                        roles.forEach(role => {
                            if (role.label == "User Administrator") role.label = "Group Administrator"; // not "User"
                            createA(`Revoke ${role.label}`).onclick = function () {
                                // https://developer.okta.com/docs/api/resources/roles#unassign-role-from-user
                                $.ajax({
                                    url: `/api/v1/users/${userId}/roles/${role.id}`,
                                    method: "DELETE"
                                }).then(() => setTimeout(showRoles, 1000));
                            };
                        });
                    }
                });
            }
            function postJson(settings) {
                settings.contentType = "application/json";
                settings.data = JSON.stringify(settings.data);
                return $.post(settings);
            }
        };
    }
    function securityAdministrators() {
        createA("Export Administrators").onclick = function () {
            var results = createDiv("Administrators");
            results.innerHTML = "Exporting ...";
            $.getJSON("/api/internal/administrators?expand=user,apps,userAdminGroups,helpDeskAdminGroups").then(admins => {
                var lines = ["First name,Last name,Email,Username,Title,Manager,Department,Administrator Role"];
                admins.forEach(admin => {
                    var profile = admin._embedded.user.profile;
                    var mgr = profile.manager || profile.managerId || "";
                    var matches;
                    if (matches = mgr.match(/CN=(.*?),OU/)) mgr = matches[1];
                    mgr = mgr.replace("\\", "");
                    function showRole(role) {
                        // FIXME: would like to show user.status, but it comes back as null. TODO: fetch it from /users
                        lines.push(commatize(profile.firstName, profile.lastName, profile.email, profile.login, profile.title || "", mgr, profile.department || "", role));
                    }
                    function appNames() {
                        var apps = admin._embedded.apps;
                        var appNames = [];
                        if (apps && apps.length > 0) {
                            apps.forEach(app => appNames.push(app.displayName));
                        } else {
                            appNames.push("(all)");
                        }
                        return appNames.join('; ');
                    }
                    function groupNames(groupType) {
                        var groups = admin._embedded[groupType];
                        var groupNames = [];
                        if (groups && groups.length > 0) {
                            groups.forEach(group => groupNames.push(group.profile.name));
                        } else {
                            groupNames.push("(all)");
                        }
                        return groupNames.join('; ');
                    }
                    if (admin.superAdmin) showRole("Super Administrator");
                    if (admin.orgAdmin) showRole("Organization Administrator");
                    if (admin.appAdmin) showRole("Application Administrator: " + appNames());
                    if (admin.userAdmin) showRole("Group Administrator: " + groupNames("userAdminGroups")); // "Group Admin", not "User Admin"
                    if (admin.helpDeskAdmin) showRole("Help Desk Administrator: " + groupNames("helpDeskAdminGroups"));
                    if (admin.readOnlyAdmin) showRole("Read Only Administrator");
                    if (admin.mobileAdmin) showRole("Mobile Administrator");
                    if (admin.apiAccessManagementAdmin) showRole("API Access Management Administrator");
                });

                results.innerHTML = "Done.";
                var a = results.appendChild(document.createElement("a"));
                a.href = URL.createObjectURL(new Blob([lines.join("\n")], {type: 'text/csv'}));
                var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
                a.download = `Administrators ${location.host.replace("-admin", "")} ${date}.csv`;
                a.click();
            });
        };
    }
    
    function exportObjects() {
        var total;
        var objectType;
        var template;
        var groups;
        var lines;
        var cancel = false;
        if (location.pathname == "/admin/users") {
            // see also Reports > Reports, Okta Password Health: https://ORG-admin.oktapreview.com/api/v1/users?format=csv
            getObjects("Users", "/api/v1/users", "id,firstName,lastName,login,email,credentialType",
                user => commatize(user.id, user.profile.firstName, user.profile.lastName, user.profile.login, user.profile.email, user.credentials.provider.type));
        } else if (location.pathname == "/admin/groups") {
            getObjects("Groups", "/api/v1/groups", "id,name,description,type", group => commatize(group.id, group.profile.name, group.profile.description || "", group.type));
        } else if (location.pathname == "/admin/apps/active") {
            getObjects("Apps", "/api/v1/apps", "id,label,name", app => commatize(app.id, app.label, app.name));
        } else {
            var appid = getAppId();
            if (appid) {
                results = createDiv("Export"); // don't var. TODO: fixme
                createA("Export App Users").onclick = function () {
                    document.body.removeChild(results.parentNode);
                    getObjects("App Users", "/api/v1/apps/" + appid + "/users", "id,userName,scope", appUser => commatize(appUser.id, appUser.credentials ? appUser.credentials.userName : "", appUser.scope));
                };
                createA("Export App Groups").onclick = function () {
                    document.body.removeChild(results.parentNode);
                    // TODO: use /api/v1/apps/${appid}/groups?expand=group
                    getObjects("App Groups", `/api/v1/apps/${appid}/groups`, "id,licenses,roles", function (appGroup) {
                        $.getJSON(`/api/v1/groups/${appGroup.id}`).then(group => {
                            groups.push(commatize(group.profile.name, appGroup.profile.licenses ? appGroup.profile.licenses.join(";") : "",
                                appGroup.profile.roles ? appGroup.profile.roles.join(";") : ""));
                            if (groups.length == total) {
                                console.log("name,licenses,roles");
                                groups.forEach(group => console.log(`,${group}`));
                            }
                        });
                        return commatize(appGroup.id, appGroup.profile.licenses ? appGroup.profile.licenses.join(";") : "",
                            appGroup.profile.roles ? appGroup.profile.roles.join(";") : "");
                    });
                };
            } else {
                results = createDiv("Export");
                results.innerHTML = "<br>Error. Go to one of these:<br><br>" + 
                    "<a href='/admin/users'>Directory > People</a><br>" + 
                    "<a href='/admin/groups'>Directory > Groups</a><br>" +
                    "<a href='/admin/people/directories'>Directory > Directory Integrations</a> and click on a Directory<br>" +
                    "<a href='/admin/apps/active'>Applications > Applications</a> and click on an App<br>" +
                    "<a href='/admin/apps/active'>Applications > Applications</a> to export Apps<br>";
            }
        }
        function getObjects(title, path, header, templateCallback) {
            total = 0;
            objectType = title;
            results = createDiv(title);
            results.innerHTML = "Loading ...";
            template = templateCallback;
            lines = [header];
            groups = [];
            $.getJSON(path).then(exportObjects);
        }
        function exportObjects(objects, status, jqXHR) {
            objects.forEach(object => lines.push(template(object)));
            total += objects.length;
            results.innerHTML = total + " " + objectType + "...<br><br>";
            createA("Cancel").onclick = () => cancel = true;
            if (cancel) {
                document.body.removeChild(results.parentNode);
                return;
            }
            var links = getLinks(jqXHR.getResponseHeader("Link"));
            if (links && links.next) {
                var nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                var path = nextUrl.pathname + nextUrl.search;
                if (jqXHR.getResponseHeader("X-Rate-Limit-Remaining") && jqXHR.getResponseHeader("X-Rate-Limit-Remaining") < 10) {
                    var interval = setInterval(() => {
                        results.innerHTML += "<br>Sleeping...";
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(interval);
                            $.getJSON(path).then(exportObjects);
                        }
                    }, 1000);
                } else {
                    $.getJSON(path).then(exportObjects);
                }
            } else {
                results.innerHTML = total + " " + objectType + ". Done.";
                var a = results.appendChild(document.createElement("a"));
                a.href = URL.createObjectURL(new Blob([lines.join("\n")], {type: 'text/csv'}));
                var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
                a.download = `Export ${objectType} ${date}.csv`;
                a.click();
            }
        }
        function getLinks(headers) {
            headers = headers.split(", ");
            var links = {};
            for (var i = 0; i < headers.length; i++) {
                var matches = headers[i].match(/<(.*)>; rel="(.*)"/);
                links[matches[2]] = matches[1];
            }
            return links;
        }
        function getAppId() {
            var path = location.pathname;
            var pathparts = path.split('/');
            if (path.match(/admin\/app/) && (pathparts.length == 6 || pathparts.length == 7)) {
                return pathparts[5];
            }
        }
    }
    
    function userHome() {
        createA("Show SSO").onclick = function () {
            var results;
            var label = "Show SSO";
            var labels = document.getElementsByClassName("app-button-name");
            if (labels.length > 0) { // Button labels on Okta homepage
                for (var i = 0; i < labels.length; i++) {
                    if (!labels[i].innerHTML.match(label)) {
                        var a = document.createElement("a");
                        a.onclick = function () {
                            getDiv();
                            getSSO(this.parentNode.previousSibling.previousSibling.href);
                        };
                        if (labels[i].clientHeight <= 17) {
                            a.innerHTML = "<br>" + label;
                        } else {
                            a.innerHTML = " - " + label;
                        }
                        a.style.cursor = "pointer";
                        labels[i].appendChild(a);
                    }
                }
            } else {
                getDiv();
                var form = results.appendChild(document.createElement("form"));
                var url = form.appendChild(document.createElement("input"));
                url.style.width = "700px";
                url.placeholder = "URL";
                url.focus();
                var input = form.appendChild(document.createElement("input"));
                input.type = "submit";
                input.value = label;
                form.onsubmit = function () {
                    getSSO(url.value);
                    return false;
                };
            }
            function getSSO(url) {
                results.innerHTML = "Loading . . .";
                $.get(url).then(response => {
                    function unentity(s) {
                        return s.replace(/&#(x..?);/g, function (m, p1) {return String.fromCharCode("0" + p1)});
                    }
                    var highlight = "style='background-color: yellow'";
                    var matches;
                    if (matches = response.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/)) {
                        var assertion = unentity(matches[2]);
                        if (matches[1] == "SAMLResponse") assertion = atob(assertion);
                        console.log(assertion);
                        assertion = assertion.replace(/\n/g, "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;")
                            .replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;")
                            .replace(/((Address|Issuer|NameID|NameIdentifier|Name|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="|=&quot;))(.*?)(&lt;|"|&quot;)/g, "$1<span " + highlight + ">$4</span>$5");
                        var postTo = unentity(response.match(/<form id="appForm" action="(.*?)"/)[1]);
                        results.innerHTML = "Post to: " + postTo + "<br><br><pre>" + indentXml(assertion, 4) + "</pre>";
                    } else if (matches = response.match(/<form(?:.|\n)*<\/form>/)) {
                        var form = matches[0].replace(/ *</g, "&lt;").replace(/>/g, "&gt;").
                            replace(/value="(.*?)"/g, 'value="<span title="$1" ' + highlight + '>...</span>"');
                        results.innerHTML = "<pre>" + form + "</pre>";
                    } else if (matches = response.match(/<div class="error-content">(?:.|\n)*?<\/div>/)) {
                        results.innerHTML = "<pre>" + matches[0] + "</pre>";
                    } else {
                        results.innerHTML = "Is this a SWA app, plugin or bookmark?";
                    }
                });
            }
            function getDiv() {
                results = createDiv("SSO");
            }
            function indentXml(xml, size) {
                var lines = xml.split("\n");
                var level = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var end = line.match("&lt;/");
                    var empty = line.match("/&gt;") || line.match(/&gt;.*&gt;/);
                    if (end && !empty) level--;
                    lines[i] = " ".repeat(size * level) + line;
                    if (!end && !empty) level++;
                }
                return lines.join("\n");
            }
        };
    }
    
    function suOrgs() {
        searcher({
            url: "/api/internal/su/orgs",
            data: function () {return {search: this.search, limit: this.limit};},
            limit: 100, // 100 is the max limit for this url.
            filter: org => org.edition != "Developer",
            comparer: (org1, org2) => org1.subdomain.localeCompare(org2.subdomain),
            template: org => {
                var href = `${org.cellURL || ""}/su/org/${org.id}`;
                return `<tr><td><a href="${href}">${org.subdomain}</a>` +
                    `<td>${org.name}` +
                    `<td><a class='link-button' href="${href}/beta-features#tab-ea-features">EA</a> ` +
                        `<a class='link-button' href="${href}/beta-features#tab-ga-features">GA</a>` +
                    `<td>${org.cell}`;
            },
            headers: "<tr><th>Subdomain<th>Name<th>Features<th>Cell",
            placeholder: "Search 100...",
            empty: true
        });
    }
    function suOrgUsers() {
        searcher({
            url: location.pathname + "/users/search",
            data: function () {return {sSearch: this.search, sColumns: "fullName,login,userId,email,tempSignOn", iDisplayLength: 10};},
            comparer: (user1, user2) => user1.fullName.localeCompare(user2.fullName),
            template: user => `<tr class=odd><td>${user.fullName}<td>${user.login}<td><a href="${location.pathname}/user-summary/${user.userId}">${user.userId}</a>` + 
                `<td>${user.email}<td>${user.tempSignOn}`,
            headers: "<tr><th>Name<th>Login<th>ID<th>Email<th>Temp Sign On",
            placeholder: "Search by First/Last/Email/Login...",
            $search: "#user-grid_filter",
            $table: "#user-grid",
            dataType: "text",
            properties: "userSearchQuery"
        });
    }

    var xsrf = $("#_xsrfToken");
    if (xsrf) $.ajaxSetup({headers: {"X-Okta-XsrfToken": xsrf.text()}});
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)' style='cursor: pointer'>" + title + " - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a><br><br>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        div.style.border = "1px solid #ddd";
        return div.appendChild(document.createElement("div"));
    }
    function createA(html) {
        var a = results.appendChild(document.createElement("a"));
        a.style.cursor = "pointer";
        a.innerHTML = html + "<br>";
        return a;
    }
    function searcher(object) {
        function searchObjects() {
            $.get({
                url: object.url, 
                data: object.data(),
                dataType: object.dataType || "json"
            }).then(function (data) {
                var objects;
                if (object.dataType == "text") {
                    const prefix = "while(1){};";
                    data = data.substr(prefix.length); // data has a prefix to prevent JSON hijacking. We have to remove the prefix.
                    data = JSON.parse(data);
                    var properties = data[object.properties].properties;
                    objects = [];
                    for (var i = 0; i < data.aaData.length; i++) {
                        var obj = {};
                        for (var p = 0; p < properties.length; p++) {
                            obj[properties[p]] = data.aaData[i][p];
                        }
                        objects.push(obj);
                    }
                } else {
                    objects = data;
                }
                var rows = "";
                if (object.filter) objects = objects.filter(object.filter);
                objects.sort(object.comparer).forEach(o => rows += object.template(o));
                $(object.$table || ".data-list-table").html(`<thead>${object.headers}</thead>` + rows);
                if (object.empty) {
                    if (objects.length == 0) {
                        $(".data-list-empty-msg").show();
                    } else {
                        $(".data-list-empty-msg").hide();
                    }
                }
            });
        }

        var timeoutID = 0;
        $(object.$search || ".data-list .data-list-toolbar")
            .html(`<span class="search-box input-fix"><span class="icon-only icon-16 magnifying-glass-16"></span> ` +
                `<input type='text' class='text-field-default' placeholder='${object.placeholder || "Search..."}' style='width: 250px'></span>`)
            .find("input")
            .keyup(function () {
                if (object.search == this.value || this.value.length < 2) return;
                object.search = this.value;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(searchObjects, 400);
            }
        );
    }
    function commatize(...fields) {
        return fields.map(field => `"${field}"`).join(',');
    }
})();
