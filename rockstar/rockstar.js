(function () {
    // What does rockstar do?
    // People page: enhanced search, Export Users menu
    // Person page: show login/email and AD info, show user detail, enhance menus/title, manage user's admin roles
    // Administrators page: Export Admins
    // Events: Expand All and Expand Each Row
    // Export Objects to CSV: eg, Users, Groups, Directory Users, App Users, App Groups, Apps, Zones, ...
    // User home page: Show SSO (SAML assertion, etc)
    // API: Pretty Print JSON
    // SU Orgs & Org Users: enhanced search
    // Many: enhanced menus
    // and more to come...

    var mainPopup;
    $ = window.$ || window.jQueryCourage;

    if (location.href == "https://gabrielsroka.github.io/rockstar/") {
        alert("To install rockstar, open your bookmark toolbar, then drag and drop it.");
        return;
    }
    if (location.host.match(/-admin/)) { // Admin pages
        mainPopup = createPopup("rockstar");
        if (location.pathname == "/admin/users") {
            directoryPeople();
        } else if (location.pathname.match("/admin/user/")) {
            directoryPerson();
        } else if (location.pathname == "/admin/access/admins") {
            securityAdministrators();
        } else if (location.pathname.match("/report/system_log_2")) {
            systemLog();
        }

        $("<li><a href='/admin/apps/add-app'>Integration Network</a>").appendTo("#nav-admin-apps-2");
        $("<li><a href='/admin/access/api/tokens'>API Tokens</a>").appendTo("#nav-admin-access-2");
        $("<li><a style='cursor: pointer'>Export Objects</a>").click(exportObjects).appendTo("#nav-admin-reports-2");
        createA("Export Objects", mainPopup).click(exportObjects);
    } else if (location.pathname == "/app/UserHome") { // User home page (non-admin)
        mainPopup = createPopup("rockstar");
        userHome();
    } else if (location.pathname.match("^/api/")) { // API pages
        let pre = document.getElementsByTagName("pre")[0];
        let o = JSON.parse(pre.innerHTML);
        let s = JSON.stringify(o, null, 4); // Pretty Print the JSON.
        if (o.length) s = "(length: " + o.length + ")\n\n" + s;
        pre.innerHTML = s;
    } else { // SU
        // Don't show mainPopup div.
        if (location.pathname == "/su/orgs") {
            suOrgs();
        } else if (location.pathname.match("/su/org/")) {
            suOrg();
            if (location.pathname.match("system_log_2")) {
                mainPopup = createPopup("rockstar");
                systemLog();
            }
        }
    }

    // Admin functions
    function directoryPeople() {
        $("<li class=option><a><span class='icon download-16'></span>Export Users</a>").click(exportObjects).appendTo(".okta-dropdown-list");
        searcher({
            url: "/api/v1/users",
            data() {return {q: this.search, limit: this.limit};},
            limit: 15, // 15 is the max limit when using q.
            comparer: (user1, user2) => (user1.profile.firstName + user1.profile.lastName).localeCompare(user2.profile.firstName + user2.profile.lastName),
            template(user) {
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
            $(".subheader").html(`${user.profile.login}, mail: ${user.profile.email}${ad ? ", " : ""}`);
            document.title += ` - ${user.profile.firstName} ${user.profile.lastName}`;
            if (ad) {
                function showADs() {
                    $.getJSON(`/api/v1/apps?filter=user.id+eq+"${userId}"&expand=user/${userId}&limit=200&q=active_directory`).then(appUsers => {
                        var adPopup = createPopup("ADs");
                        var rows = "<tr><th>AD Domain<th>Username<th>Email";
                        appUsers.forEach(appUser => {
                            var user = appUser._embedded.user;
                            rows += `<tr><td>${appUser.label}<td>${user.credentials.userName}<td>${user.profile.email}`;
                        });
                        adPopup.html(`<table class='data-list-table' style='border: 1px solid #ddd;'>${rows}</table>`);
                    });
                }
                $(`<a style='cursor: pointer'>AD: ${user.credentials.provider.name}</a>`).click(showADs).appendTo(".subheader");
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
            var userPopup = createPopup("User");
            userPopup.html(`<span class='icon icon-24 group-logos-24 logo-${user.credentials.provider.type.toLowerCase()}'></span><pre>${toString(user)}</pre>`);
        }
        createA("Show User", mainPopup).click(showUser);
        $("<li class=option><a><span class='icon person-16-gray'></span>Show User</a>").click(showUser).appendTo(".okta-dropdown-list");

        createA("Administrator Roles", mainPopup).click(function () {
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
            var rolesPopup = createPopup("Administrator Roles");
            showRoles();
            function showRoles() {
                $.getJSON(`/api/v1/users/${userId}/roles`).then(roles => {
                    if (roles.length == 0) {
                        rolesPopup.html("This user is not an admin.<br><br>");
                        allRoles.forEach(role => {
                            createA(`Grant ${role.label} Administrator`, rolesPopup).click(function () {
                                var data = {
                                    type: role.type
                                };
                                // https://developer.okta.com/docs/api/resources/roles#assign-role-to-user
                                postJSON({
                                    url: `/api/v1/users/${userId}/roles`,
                                    data
                                }).then(() => setTimeout(showRoles, 1000));
                            });
                        });
                    } else {
                        rolesPopup.html("");
                        roles.forEach(role => {
                            if (role.label == "User Administrator") role.label = "Group Administrator"; // not "User"
                            createA(`Revoke ${role.label}`, rolesPopup).click(function () {
                                // https://developer.okta.com/docs/api/resources/roles#unassign-role-from-user
                                $.ajax({
                                    url: `/api/v1/users/${userId}/roles/${role.id}`,
                                    method: "DELETE"
                                }).then(() => setTimeout(showRoles, 1000));
                            });
                        });
                    }
                });
            }
            function postJSON(settings) {
                settings.contentType = "application/json";
                settings.data = JSON.stringify(settings.data);
                return $.post(settings);
            }
        });
    }
    function securityAdministrators() {
        createA("Export Administrators", mainPopup).click(function () { // TODO: consider merging into exportObjects(). Will the Link headers be a problem?
            var adminsPopup = createPopup("Administrators");
            adminsPopup.html("Exporting ...");
            $.getJSON("/api/internal/administrators?expand=user,apps,instances,appAndInstances,userAdminGroups,helpDeskAdminGroups").then(admins => {
                var lines = ["First name,Last name,Email,Username,UserId,Title,Manager,Department,Administrator Role"];
                admins.forEach(admin => {
                    var profile = admin._embedded.user.profile;
                    var mgr = profile.manager || profile.managerId || "";
                    var matches = mgr.match(/CN=(.*?),OU/);
                    if (matches) mgr = matches[1];
                    mgr = mgr.replace("\\", "");
                    function showRole(role) {
                        // FIXME: would like to show user.status, but it comes back as null. TODO: fetch it from /users
                        lines.push(toCSV(profile.firstName, profile.lastName, profile.email, profile.login, admin.userId, profile.title || "", mgr, profile.department || "", role));
                    }
                    function appAndInstanceNames() {
                        var appAndInstanceNames = [];

                        var apps = admin._embedded.apps;
                        if (apps && apps.length > 0) {
                            apps.forEach(app => appAndInstanceNames.push("All " + app.displayName + " apps"));
                        } else {
                            appAndInstanceNames.push("(all)");
                        }

                        var instances = admin._embedded.instances;
                        if (instances && instances.length > 0) {
                            instances.forEach(instance => appAndInstanceNames.push(instance.displayName));
                        } else {
                            appAndInstanceNames.push("(all)");
                        }

                        return appAndInstanceNames.join('; ');
                    }
                    function groupNames(groupType) {
                        var groupNames = [];
                        var groups = admin._embedded[groupType];
                        if (groups && groups.length > 0) {
                            groups.forEach(group => groupNames.push(group.profile.name));
                        } else {
                            groupNames.push("(all)");
                        }
                        return groupNames.join('; ');
                    }
                    if (admin.superAdmin) showRole("Super Administrator");
                    if (admin.orgAdmin) showRole("Organization Administrator");
                    if (admin.appAdmin) showRole("Application Administrator: " + appAndInstanceNames());
                    if (admin.userAdmin) showRole("Group Administrator: " + groupNames("userAdminGroups")); // "Group Admin", not "User Admin"
                    if (admin.helpDeskAdmin) showRole("Help Desk Administrator: " + groupNames("helpDeskAdminGroups"));
                    if (admin.readOnlyAdmin) showRole("Read Only Administrator");
                    if (admin.mobileAdmin) showRole("Mobile Administrator");
                    if (admin.apiAccessManagementAdmin) showRole("API Access Management Administrator");
                });

                downloadCSV(adminsPopup, "", lines, `Administrators ${location.host.replace("-admin", "")}`);
            });
        });
    }
    function systemLog() {
        createA("Expand All", mainPopup).click(() => {
            $(".row-expander").each(function () {this.click()});
            $(".expand-all-details a").each(function () {this.click()});
        });
        createA("Expand Each Row", mainPopup).click(() => {
            $(".row-expander").each(function () {this.click()});
        });
    }

    function exportObjects() {
        var exportPopup;
        var total;
        var objectType;
        var template;
        var groups;
        var lines;
        var appId;
        var cancel = false;
        if (location.pathname == "/admin/users") {
            // see also Reports > Reports, Okta Password Health: https://ORG-admin.oktapreview.com/api/v1/users?format=csv
            startExport("Users", "/api/v1/users", "id,firstName,lastName,login,email,credentialType",
                user => toCSV(user.id, user.profile.firstName, user.profile.lastName, user.profile.login, user.profile.email, user.credentials.provider.type));
        } else if (location.pathname == "/admin/groups") {
            startExport("Groups", "/api/v1/groups", "id,name,description,type", group => toCSV(group.id, group.profile.name, group.profile.description || "", group.type));
        } else if (location.pathname == "/admin/apps/active") {
            startExport("Apps", "/api/v1/apps", "id,label,name,userNameTemplate,features", app => toCSV(app.id, app.label, app.name, app.credentials.userNameTemplate.template, app.features.join(', ')));
        } else if (location.pathname == "/admin/access/networks") {
            startExport("Zones", "/api/v1/zones", "id,name,gateways", zone => toCSV(zone.id, zone.name, zone.gateways && zone.gateways.map(gateway => gateway.value).join(', ')));
        } else if (appId = getAppId()) {
            exportPopup = createPopup("Export");
            createA("Export App Users", exportPopup).click(function () {
                exportPopup.parent().remove();
                startExport("App Users", `/api/v1/apps/${appId}/users`, "id,userName,scope,externalId", 
                    appUser => toCSV(appUser.id, appUser.credentials ? appUser.credentials.userName : "", appUser.scope, appUser.externalId));
            });
            createA("Export App Groups", exportPopup).click(function () {
                exportPopup.parent().remove();
                // TODO: use /api/v1/apps/${appid}/groups?expand=group
                startExport("App Groups", `/api/v1/apps/${appId}/groups`, "id,licenses,roles", appGroup => {
                    $.getJSON(`/api/v1/groups/${appGroup.id}`).then(group => {
                        groups.push(toCSV(group.profile.name, appGroup.profile.licenses ? appGroup.profile.licenses.join(";") : "",
                            appGroup.profile.roles ? appGroup.profile.roles.join(";") : ""));
                        if (groups.length == total) {
                            console.log("name,licenses,roles");
                            groups.forEach(group => console.log(`,${group}`));
                        }
                    });
                    return toCSV(appGroup.id, appGroup.profile.licenses ? appGroup.profile.licenses.join(";") : "",
                        appGroup.profile.roles ? appGroup.profile.roles.join(";") : "");
                });
            });
        } else {
            exportPopup = createPopup("Export");
            exportPopup.html("Error. Go to one of these:<br><br>" +
                "<a href='/admin/users'>Directory > People</a><br>" +
                "<a href='/admin/groups'>Directory > Groups</a><br>" +
                "<a href='/admin/people/directories'>Directory > Directory Integrations</a> and click on a Directory<br>" +
                "<a href='/admin/apps/active'>Applications > Applications</a> and click on an App<br>" +
                "<a href='/admin/apps/active'>Applications > Applications</a> to export Apps<br>" +
                "<a href='/admin/access/networks'>Security > Networks</a><br>");
        }
        function startExport(title, url, header, templateCallback) {
            total = 0;
            objectType = title;
            exportPopup = createPopup(title);
            exportPopup.html("Loading ...");
            template = templateCallback;
            lines = [header];
            groups = [];
            $.getJSON(url).then(getObjects);
        }
        function getObjects(objects, status, jqXHR) {
            objects.forEach(object => lines.push(template(object)));
            total += objects.length;
            exportPopup.html(total + " " + objectType + "...<br><br>");
            createA("Cancel", exportPopup).click(() => cancel = true);
            if (cancel) {
                exportPopup.parent().remove();
                return;
            }
            var links = getLinks(jqXHR.getResponseHeader("Link"));
            if (links && links.next) {
                var nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                var url = nextUrl.pathname + nextUrl.search;
                if (jqXHR.getResponseHeader("X-Rate-Limit-Remaining") && jqXHR.getResponseHeader("X-Rate-Limit-Remaining") < 10) {
                    var intervalID = setInterval(() => {
                        exportPopup.html(exportPopup.html() + "<br>Sleeping...");
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            $.getJSON(url).then(getObjects);
                        }
                    }, 1000);
                } else {
                    $.getJSON(url).then(getObjects);
                }
            } else {
                downloadCSV(exportPopup, total + " " + objectType + ". ", lines, `Export ${objectType}`);
            }
        }
        function getLinks(headers) {
            headers = headers.split(", ");
            var links = {};
            for (var i = 0; i < headers.length; i++) {
                var [, url, name] = headers[i].match(/<(.*)>; rel="(.*)"/);
                links[name] = url;
            }
            return links;
        }
        function getAppId() {
            var path = location.pathname;
            var pathparts = path.split('/');
            if (path.match("admin/app") && (pathparts.length == 6 || pathparts.length == 7)) {
                return pathparts[5];
            }
        }
    }

    // User functions
    function userHome() {
        createA("Show SSO", mainPopup).click(function () {
            var ssoPopup;
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
                var form = ssoPopup.appendChild(document.createElement("form"));
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
                ssoPopup.html("Loading . . .");
                $.get(url).then(response => {
                    function unentity(s) {
                        return s.replace(/&#(x..?);/g, (m, p1) => String.fromCharCode("0" + p1));
                    }
                    var highlight = "style='background-color: yellow'";
                    var matches;
                    if (matches = response.match(/name="(SAMLResponse|wresult)".*value="(.*?)"/)) {
                        var assertion = unentity(matches[2]);
                        if (matches[1] == "SAMLResponse") assertion = atob(assertion);
                        console.log(assertion);
                        assertion = assertion.replace(/\n/g, "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&gt;&lt;/g, "&gt;\n&lt;")
                            .replace(/((SignatureValue|X509Certificate)&gt;.{80})(.*)&lt;/g, "$1<span title='$3' " + highlight + ">...</span>&lt;")
                            .replace(/((Address|Issuer|NameID|NameIdentifier|Name|AttributeValue|Audience|Destination|Recipient)(.*&gt;|="|=&quot;))(.*?)(&lt;|"|&quot;)/g, 
                                "$1<span " + highlight + ">$4</span>$5");
                        var postTo = unentity(response.match(/<form id="appForm" action="(.*?)"/)[1]);
                        ssoPopup.html("Post to: " + postTo + "<br><br><pre>" + indentXml(assertion, 4) + "</pre>");
                    } else if (matches = response.match(/<form(?:.|\n)*<\/form>/)) {
                        var form = matches[0].replace(/ *</g, "&lt;").replace(/>/g, "&gt;").
                            replace(/value="(.*?)"/g, 'value="<span title="$1" ' + highlight + '>...</span>"');
                        ssoPopup.html(`<pre>${form}</pre>`);
                    } else if (matches = response.match(/<div class="error-content">(?:.|\n)*?<\/div>/)) {
                        ssoPopup.html(`<pre>${matches[0]}</pre>`);
                    } else {
                        ssoPopup.html("Is this a SWA app, plugin or bookmark?");
                    }
                });
            }
            function getDiv() {
                ssoPopup = createPopup("SSO");
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
        });
        $.getJSON(`/api/v1/sessions/me`).then(session => {
            $(".icon-clock-light").parent().append("<div>Expires in " + Math.round((new Date(session.expiresAt) - new Date()) / 60 / 1000) + " minutes</div>");
        });
    }

    // SU functions
    function suOrgs() {
        searcher({
            url: "/api/internal/su/orgs",
            data() {return {search: this.search, limit: this.limit};},
            limit: 100, // 100 is the max limit for this url.
            //filter: org => org.edition != "Developer",
            comparer(org1, org2) {
                var d1 = org1.edition == "Developer";
                var d2 = org2.edition == "Developer";
                if ((d1 && d2) || (!d1 && !d2)) return org1.subdomain.localeCompare(org2.subdomain);
                return d1 ? 1 : -1;
            },
            template(org) {
                var href = `${org.cellURL || ""}/su/org/${org.id}`;
                return `<tr><td><a href="${href}">${org.subdomain}</a>` +
                    `<td>${org.name}` +
                    `<td><a class='link-button' href="${href}/features">Features</a> ` +
                    `<td>${org.cell}`;
            },
            headers: "<tr><th>Subdomain<th>Name<th>Features<th>Cell",
            placeholder: "Search 100...",
            empty: true
        });
    }
    function suOrg() {
        searcher({
            url: location.pathname + "/users/search",
            data() {return {sSearch: this.search, sColumns: "fullName,login,userId,email,tempSignOn", iDisplayLength: 10};},
            comparer: (user1, user2) => user1.fullName.localeCompare(user2.fullName),
            template: user => `<tr class=odd><td>${user.fullName}<td>${user.login}<td><a href="${location.pathname}/user-summary/${user.userId}">${user.userId}</a><td>${user.email}<td>${user.tempSignOn}`,
            headers: "<tr><th>Name<th>Login<th>ID<th>Email<th>Temp Sign On",
            placeholder: "Search by First/Last/Email/Login...",
            $search: "#user-grid_filter",
            $table: "#user-grid",
            dataType: "text",
            properties: "userSearchQuery"
        });
    }

    // Util functions
    if ($) {
        var xsrf = $("#_xsrfToken");
        if (xsrf.length) $.ajaxSetup({headers: {"X-Okta-XsrfToken": xsrf.text()}});
    }
    function createPopup(title) {
        var popup = $(`<div style='position: absolute; z-index: 1000; left: 4px; top: 4px; background-color: white; padding: 8px; border: 1px solid #ddd;'>` +
            `<a onclick='document.body.removeChild(this.parentNode)' style='cursor: pointer'>${title} - close</a> ` + 
            `<a href='https://gabrielsroka.github.io/' target='_blank'>?</a><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
    function createA(html, parent) {
        return $(`<div><a style='cursor: pointer'>${html}</a></div>`).appendTo(parent);
    }
    function searcher(object) { // TODO: Save search string in location.hash # in URL. Reload from there.
        function searchObjects() {
            var settings = {
                url: object.url,
                data: object.data()
            };
            if (object.dataType == "text") {
                settings.dataType = "text";
                $.get(settings).then(text => {
                    const prefix = "while(1){};";
                    var json = text.substr(prefix.length); // text has a prefix to prevent JSON hijacking. We have to remove the prefix.
                    var data = JSON.parse(json);
                    var properties = data[object.properties].properties;
                    var objects = [];
                    for (var i = 0; i < data.aaData.length; i++) {
                        var obj = {};
                        for (var p = 0; p < properties.length; p++) {
                            obj[properties[p]] = data.aaData[i][p];
                        }
                        objects.push(obj);
                    }
                    showObjects(objects);
                });
            } else {
                settings.dataType = "json";
                $.getJSON(settings).then(objects => showObjects(objects));
            }
        }
        function showObjects(objects) {
            var rows = "";
            if (object.filter) objects = objects.filter(object.filter);
            objects.sort(object.comparer).forEach(obj => rows += object.template(obj));
            $(object.$table || ".data-list-table").html(`<thead>${object.headers}</thead>${rows}`);
            if (object.empty) {
                if (objects.length == 0) {
                    $(".data-list-empty-msg").show();
                } else {
                    $(".data-list-empty-msg").hide();
                }
            }
        }

        var timeoutID = 0;
        $(object.$search || ".data-list .data-list-toolbar")
            .html(`<span class="search-box input-fix"><span class="icon-only icon-16 magnifying-glass-16"></span> ` +
                `<input type='text' class='text-field-default' placeholder='${object.placeholder || "Search..."}' style='width: 250px'></span>`)
            .find("input")
            .keyup(function (event) {
                const ESC = 27;
                if (event.which == ESC) {
                    this.value = object.search = "";
                    showObjects([]);
                    return;
                }
                if (object.search == this.value || this.value.length < 2) return;
                object.search = this.value;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(searchObjects, 400);
            }
        );
    }
    function toCSV(...fields) {
        return fields.map(field => `"${field && field.replace(/"/g, '""')}"`).join(',');
    }
    function downloadCSV(popup, html, lines, filename) {
        popup.html(html + "Done.");
        var a = $("<a>").appendTo(popup);
        a.attr("href", URL.createObjectURL(new Blob([lines.join("\n")], {type: 'text/csv'})));
        var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
        a.attr("download", `${filename} ${date}.csv`);
        a[0].click();
    }
})();
