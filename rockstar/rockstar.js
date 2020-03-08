(function () {
    // What does rockstar do?
    //   Export Objects to CSV: Users, Groups, Group Members, Directory Users, App Users, App Groups, Apps, App Notes, Network Zones, Admins, etc.
    //   User home page: Show SSO (SAML assertion, etc)
    //   People page: enhanced search
    //   Person page: show login/email and AD info, show user detail, enhance menus/title, manage user's admin roles, verify factor
    //   Groups page: search groups
    //   Events: Expand All and Expand Each Row
    //   API: API Explorer, Pretty Print JSON
    //   Many: enhanced menus
    // and more to come...

    var mainPopup;
    $ = window.$ || window.jQueryCourage;
    const headers = {'X-Okta-User-Agent-Extended': 'rockstar'};

    if (location.href == "https://gabrielsroka.github.io/rockstar/") {
        alert("To install rockstar, open your bookmark toolbar, then drag and drop it. To use it, login to Okta or Okta Admin, then click rockstar. See the Usage instructions on this page.");
        return;
    }
    if (location.pathname.match("^/(api|oauth2|\\.well-known)/")) {
        formatJSON();
    } else if (location.host.match(/-admin/)) { // Admin pages
        mainPopup = createPopup("rockstar");
        quickUpdate();
        if (location.pathname == "/admin/users") {
            directoryPeople();
        } else if (location.pathname.match("/admin/user/")) {
            directoryPerson();
        } else if (location.pathname == "/admin/groups") {
            directoryGroups();
        } else if (location.pathname == "/admin/access/admins") {
            securityAdministrators();
        } else if (location.pathname.match("/report/system_log_2")) {
            systemLog();
        } else if (location.pathname.match("/admin/app/active_directory")) {
            activeDirectory();
        } else if (location.pathname == "/admin/access/identity-providers") {
            identityProviders();
        }

        $("<li><a href='/admin/apps/add-app'>Integration Network</a>").appendTo("#nav-admin-apps-2");
        $("<li><a href='/admin/access/api/tokens'>API Tokens</a>").appendTo("#nav-admin-access-2");
        exportObjects();
        //createPrefixA("<li>", "Export Objects", "#nav-admin-reports-2", exportObjects);
        apiExplorer();
    } else if (location.pathname == "/app/UserHome") { // User home page (non-admin)
        mainPopup = createPopup("rockstar");
        quickUpdate();
        userHome();
    //} else if (location.host == "developer.okta.com" && location.pathname.startsWith("/docs/reference/api/")) {
    //    tryAPI();
    }

    function quickUpdate() {
        $(`<a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener'>Quick Update and Good News! (Feb 21, 2020)</a><br><br>`).appendTo(mainPopup);
    }

    // Admin functions
    function directoryPeople() {
        createDivA("Search Users (experimental)", mainPopup, () => {
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
        });
    }
    function directoryPerson() {
        var userId = location.pathname.split("/")[5];
        var user;
        getJSON(`/api/v1/users/${userId}`).then(aUser => {
            user = aUser;
            var ad = user.credentials.provider.type == "ACTIVE_DIRECTORY";
            $(".subheader").html(`${user.profile.login}, email: ${user.profile.email}${ad ? ", " : ""}`);
            document.title += ` - ${user.profile.firstName} ${user.profile.lastName}`;
            if (ad) {
                function showADs() {
                    getJSON(`/api/v1/apps?filter=user.id+eq+"${userId}"&expand=user/${userId}&limit=200&q=active_directory`).then(appUsers => {
                        var adPopup = createPopup("Active Directory");
                        var rows = "<tr><th>Domain<th>Username<th>Email";
                        appUsers.forEach(appUser => {
                            var user = appUser._embedded.user;
                            rows += `<tr><td>${appUser.label}<td>${user.credentials.userName}<td>${user.profile.email}`;
                        });
                        adPopup.html(`<table class='data-list-table' style='border: 1px solid #ddd;'>${rows}</table>`);
                    });
                }
                createA("AD: " + user.credentials.provider.name, ".subheader", showADs);
                createPrefixA("<li class=option>", "<span class='icon directory-16'></span>Show AD", ".okta-dropdown-list", showADs);
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
            var logo = user.credentials.provider.type == "LDAP" ? "ldap_sun_one" : user.credentials.provider.type.toLowerCase();
            userPopup.html(`<span class='icon icon-24 group-logos-24 logo-${logo}'></span><pre>${toString(user)}</pre>`);
        }
        createDivA("Show User", mainPopup, showUser);
        createPrefixA("<li class=option>", "<span class='icon person-16-gray'></span>Show User", ".okta-dropdown-list", showUser);

        createDivA("Verify Factors", mainPopup, async function () {
            function mapFactors(factor) {
                const supportedFactors = [
                    {provider: 'OKTA', type: 'push', icon: "okta-otp", name: "Okta Verify with Push", sort: 0},
                    {provider: 'OKTA', type: "token:software:totp", icon: "okta-otp", name: "Okta Verify (OTP)", sort: 1},
                    {provider: 'GOOGLE', type: 'token:software:totp', icon: "otp", name: "Google Authenticator", sort: 2},
                    {provider: 'OKTA', type: 'sms', icon: "sms", name: "SMS Authentication", sort: 3},
                    {provider: 'OKTA', type: 'call', icon: "call", name: "Voice Call Authentication", sort: 4},
                    {provider: 'OKTA', type: 'email', icon: "email", name: "Email Authentication", sort: 5},
                    {provider: 'OKTA', type: 'question', icon: "question", name: "Security Question", sort: 6}
                ];
                const type = factor.factorType;
                const supported = supportedFactors.find(f => f.provider == factor.provider && f.type == type);
                if (!supported || factor.status != 'ACTIVE') return {supported: false};
                const {icon, name, sort} = supported;
                const radio = `<label><input type=radio name=factor value='${factor.id}'><span class="mfa-${icon}-30 valign-middle margin-l-10 margin-r-5"></span>` +
                    `${name}</label><br>`;
                if (type == 'question') {
                    var html = '<br>' + factor.profile.questionText + '<br>';
                    var inputType = 'password';
                    var field = 'answer';
                } else {
                    html = ' Code';
                    inputType = 'text';
                    field = 'passCode';
                }
                return {id: factor.id, supported: true, sort, radio, type, name, html, inputType, field};
            }
            const verifyPopup = createPopup("Verify Factors");
            var factors = await getJSON(`/api/v1/users/${userId}/factors`);
            factors = factors.map(mapFactors).filter(f => f.supported).sort((f1, f2) => f1.sort - f2.sort);
            if (factors.length == 0) {
                verifyPopup.html("No supported factors were found.");
                return;
            }
            const html = factors.map(f => f.radio).join('');
            verifyPopup.html("<form id=factorForm>" + html + "<br><button class='link-button'>Next</button></form>");
            if (factors.length > 1) {
                factorForm.factor[0].checked = "checked";
            } else {
                factorForm.factor.checked = "checked";
            }
            factorForm.onsubmit = function () {
                const factor = factors.find(f => f.id == this.factor.value);
                const url = `/api/v1/users/${userId}/factors/${factor.id}/verify`;
                if (factor.type == "push") {
                    postJSON({url}).then(response => {
                        const intervalMs = 4000; // time in ms.
                        verifyPopup.html(response.factorResult);
                        const intervalID = setInterval(async () => {
                            const url = new URL(response._links.poll.href);
                            const poll = await getJSON(url.pathname);
                            verifyPopup.html(poll.factorResult);
                            if (poll.factorResult != "WAITING") {
                                clearInterval(intervalID);
                            }
                        }, intervalMs);
                    }).fail(jqXHR => verifyPopup.html(jqXHR.responseJSON.errorSummary));
                } else {
                    if (factor.type == "sms" || factor.type == "call" || factor.type == "email") {
                        postJSON({url})
                        .fail(jqXHR => verifyPopup.html(jqXHR.responseJSON.errorSummary));
                    }
                    verifyPopup.html("");
                    const verifyForm = verifyPopup[0].appendChild(document.createElement("form")); // Cuz "<form>" didn't work.
                    verifyForm.innerHTML = factor.name + '<br><div id=error></div>' + factor.html + ` <br><input id=answer type=${factor.inputType} autocomplete=off><br>` +
                        "<button class='link-button'>Verify</button>";
                    answer.focus(); // Cuz "autofocus" didn't work.
                    verifyForm.onsubmit = function () {
                        const data = {};
                        data[factor.field] = answer.value;
                        postJSON({url, data})
                        .then(response => verifyPopup.html(response.factorResult))
                        .fail(jqXHR => error.innerHTML = '<br>' + jqXHR.responseJSON.errorSummary);
                        return false; // Cancel form.
                    };
                }
                return false; // Cancel form.
            };
        });
        
        createDivA("Administrator Roles", mainPopup, function () {
            var allRoles = [
                {type: "SUPER_ADMIN", label: "Super"},
                {type: "ORG_ADMIN", label: "Organization"},
                {type: "APP_ADMIN", label: "Application"},
                {type: "USER_ADMIN", label: "Group"}, // not "User"
                {type: "HELP_DESK_ADMIN", label: "Help Desk"},
                {type: "READ_ONLY_ADMIN", label: "Read Only"},
                {type: "MOBILE_ADMIN", label: "Mobile"},
                {type: "API_ACCESS_MANAGEMENT_ADMIN", label: "API Access Management"},
                {type: "REPORT_ADMIN", label: "Report"}
            ];
            var rolesPopup = createPopup("Administrator Roles");
            showRoles();
            function showRoles() {
                getJSON(`/api/v1/users/${userId}/roles`).then(roles => {
                    if (roles.length == 0) {
                        rolesPopup.html("This user is not an admin.<br><br>");
                        allRoles.forEach(role => {
                            createDivA(`Grant ${role.label} Administrator`, rolesPopup, function () {
                                rolesPopup.html("Loading...");
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
                            createDivA(`Revoke ${role.label}`, rolesPopup, function () {
                                rolesPopup.html("Loading...");
                                // https://developer.okta.com/docs/api/resources/roles#unassign-role-from-user
                                deleteJSON(`/api/v1/users/${userId}/roles/${role.id}`)
                                .then(() => setTimeout(showRoles, 1000));
                            });
                        });
                    }
                }).fail(jqXHR => rolesPopup.html(jqXHR.responseJSON.errorSummary + "<br><br>"));
            }
        });
    }

    function directoryGroups() {
        createDivA("Search Groups", mainPopup, function () {
            var popup = createPopup("Search Groups with Name Containing");
            var form = $("<form>Name <input class=name style='width: 300px'> " + 
                "<input type=submit value=Search></form><br><div class=results></div>").appendTo(popup);
            form.submit(event => {
                getJSON("/api/v1/groups").then(groups => {
                    groups = groups
                        .filter(group => group.profile.name.match(new RegExp(form.find("input.name").val(), "i")))
                        .map(group => group.profile.name.link("/admin/group/" + group.id));
                    if (groups.length > 0) {
                        var results = groups.join("<br>");
                    } else {
                        results = "Not found";
                    }
                    popup.find("div.results").html(results);
                });
                event.preventDefault();
            });
            form.find("input.name").focus();
        });
        createDivA("Search Groups (experimental)", mainPopup, () => {
            const object = {
                url: "/api/v1/groups?expand=stats",
                data() {this.match = new RegExp(this.search, "i"); return {limit: this.limit};},
                filter: group => group.profile.name.match(object.match),
                limit: 10000,
                comparer: (group1, group2) => group1.profile.name.localeCompare(group2.profile.name),
                template(group) {
                    const logo = group._links.logo[0].href.split('/')[7].split('-')[0];
                    return `<tr><td class=column-width><span class='icon icon-24 group-logos-24 logo-${logo}'></span>` +
                        `<td><a href="/admin/group/${group.id}">${group.profile.name}</a>` +
                        `<td>${group.profile.description || "No description"}` + 
                        `<td>${group._embedded.stats.usersCount}` +
                        `<td>${group._embedded.stats.appsCount}` +
                        `<td>${group._embedded.stats.groupPushMappingsCount}`;
                },
                headers: "<tr><th>Source<th>Name<th>Description<th>People<th>Apps<th>Directories",
                placeholder: "Search name with wildcard...",
                empty: true
            };
            searcher(object);
        });
    }
    
    function securityAdministrators() {
        createDivA("Export Administrators", mainPopup, function () { // TODO: consider merging into exportObjects(). Will the Link headers be a problem?
            const adminsPopup = createPopup("Administrators");
            adminsPopup.html("Exporting ...");
            const header = "First name,Last name,Email,Username,UserId,Title,Manager,Department,Administrator Role";
            const lines = [];
            getJSON("/api/internal/administrators?expand=user,apps,instances,appAndInstances,userAdminGroups,helpDeskAdminGroups")
            .then(getAdmins)
            .fail(jqXHR => adminsPopup.html(jqXHR.responseJSON.errorSummary + "<br><br>"));

            function getAdmins(admins, status, jqXHR) {
                admins.forEach(admin => {
                    const profile = admin._embedded.user.profile;
                    var mgr = profile.manager || profile.managerId || "";
                    const matches = mgr.match(/CN=(.*?),OU/);
                    if (matches) mgr = matches[1];
                    mgr = mgr.replace("\\", "");
                    function showRole(role) {
                        // FIXME: would like to show user.status, but it comes back as null. TODO: fetch it from /users
                        lines.push(toCSV(profile.firstName, profile.lastName, profile.email, profile.login, admin.userId, profile.title || "", mgr, profile.department || "", role));
                    }
                    function appAndInstanceNames() {
                        const appAndInstanceNames = [];

                        const apps = admin._embedded.apps;
                        if (apps && apps.length > 0) {
                            apps.forEach(app => appAndInstanceNames.push("All " + app.displayName + " apps"));
                        } else {
                            appAndInstanceNames.push("(all)");
                        }

                        const instances = admin._embedded.instances;
                        if (instances && instances.length > 0) {
                            instances.forEach(instance => appAndInstanceNames.push(instance.displayName));
                        } else {
                            appAndInstanceNames.push("(all)");
                        }

                        return appAndInstanceNames.join('; ');
                    }
                    function groupNames(groupType) {
                        const groupNames = [];
                        const groups = admin._embedded[groupType];
                        if (groups && groups.length > 0) {
                            groups.forEach(group => groupNames.push(group.profile.name));
                        } else {
                            groupNames.push("(all)");
                        }
                        return groupNames.join('; ');
                    }
                    if (admin.superAdmin || admin.orgAdministratorGroup.superAdmin) showRole("Super Administrator");
                    if (admin.orgAdmin || admin.orgAdministratorGroup.orgAdmin) showRole("Organization Administrator");
                    if (admin.appAdmin || admin.orgAdministratorGroup.appAdmin) showRole("Application Administrator: " + appAndInstanceNames());
                    if (admin.userAdmin || admin.orgAdministratorGroup.userAdmin) showRole("Group Administrator: " + groupNames("userAdminGroups")); // "Group Admin", not "User Admin"
                    if (admin.helpDeskAdmin || admin.orgAdministratorGroup.helpDeskAdmin) showRole("Help Desk Administrator: " + groupNames("helpDeskAdminGroups"));
                    if (admin.readOnlyAdmin || admin.orgAdministratorGroup.readOnlyAdmin) showRole("Read Only Administrator");
                    if (admin.mobileAdmin || admin.orgAdministratorGroup.mobileAdmin) showRole("Mobile Administrator");
                    if (admin.apiAccessManagementAdmin || admin.orgAdministratorGroup.apiAccessManagementAdmin) showRole("API Access Management Administrator");
                    if (admin.reportAdmin || admin.orgAdministratorGroup.reportAdmin) showRole("Report Administrator");
                });

                const link = jqXHR.getResponseHeader("Link");
                const links = link ? getLinks(link) : null;
                if (links && links.next) {
                    const nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                    const url = nextUrl.pathname + nextUrl.search;
                    const remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
                    if (remaining && remaining < 10) {
                        const intervalID = setInterval(() => {
                            adminsPopup.html(adminsPopup.html() + "<br>Sleeping...");
                            if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                                clearInterval(intervalID);
                                getJSON(url).then(getAdmins);
                            }
                        }, 1000);
                    } else {
                        getJSON(url).then(getAdmins);
                    }
                } else {
                    downloadCSV(adminsPopup, "", header, lines, `Administrators ${location.host.replace("-admin", "")}`);
                }                
            }
        });
    }
    function systemLog() {
        createDivA("Expand All", mainPopup, () => {
            $(".row-expander").each(function () {this.click()});
            $(".expand-all-details a").each(function () {this.click()});
        });
        createDivA("Expand Each Row", mainPopup, () => {
            $(".row-expander").each(function () {this.click()});
        });
    }
    function activeDirectory() {
        createDivA("Add OU Tooltips", mainPopup, () => {
            addTooltips("user");
            addTooltips("group");

            function addTooltips(type) {
                var els = document.querySelectorAll("#orgunittree input");
                if (!els.length) els = document.querySelectorAll("#ad-import-ou-" + type + "-picker input");
                els.forEach(el => {
                    el.parentNode.title = el.value;
                    //el.previousSibling.click();
                });
            }
        });        
        createDivA("Export OUs", mainPopup, () => {
            var ouPopup = createPopup("OUs");
            var ous = [];
            exportOUs("user");
            exportOUs("group");
            downloadCSV(ouPopup, ous.length + " OUs exported. ", "OU,type", ous, "AD OUs");

            function exportOUs(type) {
                var els = document.querySelectorAll("." + type + "outreenode.tree-element-chosen");
                if (!els.length) els = document.querySelectorAll("#ad-import-ou-" + type + "-picker input:checked.ou-checkbox-tree-item");
                els.forEach(el => ous.push(toCSV(el.value, type)));
            }
        });           
    }
    function identityProviders() {
        createDivA("SAML IdPs", mainPopup, () => {
            getJSON(`/api/v1/idps?type=SAML2`).then(idps => {
                getJSON('/api/v1/idps/credentials/keys').then(keys => {
                    var idpPopup = createPopup("SAML IdPs");
                    var rows = "<tr><th>Name<th>Certificate Expires On<th>Days from today";
                    idps.forEach(idp => {
                        var key = keys.filter(key => key.kid == idp.protocol.credentials.trust.kid)[0];
                        var days = Math.trunc((new Date(key.expiresAt) - new Date()) / 1000 / 60 / 60 / 24);
                        var style = days < 30 ? "style='background-color: red; color: white'" : "";
                        rows += `<tr><td>${idp.name}<td>${key.expiresAt}<td ${style}}'>${days}`;
                    });
                    idpPopup.html(`<table class='data-list-table' style='border: 1px solid #ddd;'>${rows}</table>`);
                });
            });
        });      
    }

    function exportObjects() {
        var exportPopup;
        var total;
        var objectType;
        var template;
        var header;
        var lines;
        var appId;
        var groupId;
        var cancel;
        if (location.pathname == "/admin/users") {
            // see also Reports > Reports, Okta Password Health: https://ORG-admin.oktapreview.com/api/v1/users?format=csv
            createDivA("Export Users", mainPopup, function () {
                exportPopup = createPopup("Export Users");
                exportPopup.append("<br>Columns to export");
                var checkboxDiv = $("<div style='overflow-y: scroll; height: 152px; width: 300px; border: 1px solid #ccc;'></div>").appendTo(exportPopup);
                
                function addCheckbox(value, text) {
                    const checked = exportColumns.includes(value) ? "checked" : "";
                    checkboxDiv.html(checkboxDiv.html() + `<label><input type=checkbox value='${value}' ${checked}>${text}</label><br>`);
                }
                const user = {
                    id: "User Id", 
                    status: "Status", 
                    created: "Created Date", 
                    activated: "Activated Date", 
                    statusChanged: "Status Changed Date", 
                    lastLogin: "Last Login Date", 
                    lastUpdated: "Last Updated Date", 
                    passwordChanged: "Password Changed Date", 
                    transitioningToStatus: "Transitioning to Status", 
                    "credentials.provider.type": "Credential Provider Type",
                    "credentials.provider.name": "Credential Provider Name"
                };
                const defaultColumns = "id,status,profile.login,profile.firstName,profile.lastName,profile.email";
                const exportColumns = (localStorage.rockstarExportUserColumns || defaultColumns).replace(/ /g, "").split(",");
                for (const p in user) addCheckbox(p, user[p]);
                getJSON("/api/v1/meta/schemas/user/default").then(schema => {
                    const base = schema.definitions.base.properties;
                    const custom = schema.definitions.custom.properties;
                    for (const p in base) addCheckbox("profile." + p, base[p].title);
                    for (const p in custom) addCheckbox("profile." + p, custom[p].title);
                }).fail(() => {
                    const profile = {
                        login: "Username",
                        firstName: "First name",
                        lastName: "Last name",
                        middleName: "Middle name",
                        honorificPrefix: "Honorific prefix",
                        honorificSuffix: "Honorific suffix",
                        email: "Primary email",
                        title: "Title",
                        displayName: "Display name",
                        nickName: "Nickname",
                        profileUrl: "Profile Url",
                        secondEmail: "Secondary email",
                        mobilePhone: "Mobile phone",
                        primaryPhone: "Primary phone",
                        streetAddress: "Street address",
                        city: "City",
                        state: "State",
                        zipCode: "Zip code",
                        countryCode: "Country code",
                        postalAddress: "Postal Address",
                        preferredLanguage: "Preferred language",
                        locale: "Locale",
                        timezone: "Time zone",
                        userType: "User type",
                        employeeNumber: "Employee number",
                        costCenter: "Cost center",
                        organization: "Organization",
                        division: "Division",
                        department: "Department",
                        managerId: "Manager Id",
                        manager: "Manager"
                    };
                    // TODO: since user can't see /schemas, let them know they can only use base attrs.
                    for (const p in profile) addCheckbox("profile." + p, profile[p]);
                });
    
                var exportArgs = localStorage.rockstarExportUserArgs || "";
                exportPopup.append(`<br><br>Query, Filter, or Search&nbsp;&nbsp;` +
                    `<a href='https://developer.okta.com/docs/reference/api/users/#list-users' target='_blank' rel='noopener'>Help</a><br>` +
                    `<input id=exportargs list=parlist value='${exportArgs}' style='width: 300px'><br><br>` + 
                    `<div id=error>&nbsp;</div><br>` +
                    `<datalist id=parlist><option>q=Smith<option>filter=status eq "DEPROVISIONED"<option>filter=profile.lastName eq "Smith"` +
                    `<option>search=status eq "DEPROVISIONED"<option>search=profile.lastName eq "Smith"</datalist>`);
                createDivA("Export", exportPopup, function () {
                    exportArgs = $("#exportargs").val();
                    if (exportArgs.startsWith("?")) exportArgs = exportArgs.substring(1);
                    var exportHeaders = [];
                    var exportColumns = [];
                    checkboxDiv.find("input:checked").each(function () {
                        exportHeaders.push(this.parentNode.textContent);
                        exportColumns.push(this.value);
                    });
                    if (exportHeaders.length) {
                        $("#error").html("&nbsp;");
                        exportHeaders = exportHeaders.join(",");
                        localStorage.rockstarExportUserColumns = exportColumns.join(",");
                        localStorage.rockstarExportUserArgs = exportArgs;
                        startExport("Users", `/api/v1/users?${exportArgs}`, exportHeaders, user => toCSV(...fields(user, exportColumns)));
                    } else {
                        $("#error").html("Select at least 1 column.");
                    }
                }, "class='link-button'");
            });
        } else if (location.pathname.match("/admin/groups")) {
            createDivA("Export Groups", mainPopup, function () {
                startExport("Groups", "/api/v1/groups", "id,name,description,type", 
                    group => toCSV(group.id, group.profile.name, group.profile.description || "", group.type));
            });
            createDivA("Export Groups with User and App Counts", mainPopup, function () {
                startExport("Groups", "/api/v1/groups?expand=stats", "id,name,description,type,usersCount,appsCount", 
                    group => toCSV(group.id, group.profile.name, group.profile.description || "", group.type, group._embedded.stats.usersCount, group._embedded.stats.appsCount));
            });
            createDivA("Export Group Rules", mainPopup, function () {
                startExport("Group Rules", "/api/v1/groups/rules", "id,name,status,if,assignToGroupIds,countOfExcludedUsers", 
                    rule => toCSV(rule.id, rule.name, rule.status, rule.conditions.expression.value, rule.actions.assignUserToGroups.groupIds.join(";"), rule.conditions.people ? rule.conditions.people.users.exclude.length : 0));
            });
        } else if (location.pathname == "/admin/apps/active") {
            createDivA("Export Apps", mainPopup, function () {
                startExport("Apps", "/api/v1/apps", "id,label,name,userNameTemplate,features,signOnMode,status", 
                    app => toCSV(app.id, app.label, app.name, app.credentials.userNameTemplate.template, app.features.join(', '), app.signOnMode, app.status));
            });
            createDivA("Export App Notes", mainPopup, function () {
                startExport("App Notes", "/api/v1/apps", "id,label,name,userNameTemplate,features,signOnMode,status,endUserAppNotes,adminAppNotes", async app => {
                    var response = await fetch(`/admin/app/${app.name}/instance/${app.id}/settings/general`);
                    var html = await response.text();
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, "text/html");
                    var enduserAppNotes = doc.getElementById("settings.enduserAppNotes") ? doc.getElementById("settings.enduserAppNotes").innerHTML : "";
                    var adminAppNotes = doc.getElementById("settings.adminAppNotes") ? doc.getElementById("settings.adminAppNotes").innerHTML : "";
                    return toCSV(app.id, app.label, app.name, app.credentials.userNameTemplate.template, app.features.join(', '), app.signOnMode, app.status, enduserAppNotes, adminAppNotes);
                });
            });
            createDivA("Export Apps (custom)", mainPopup, function () {
                exportPopup = createPopup("Export Apps");
                exportPopup.append("<br>Columns to export");
                var checkboxDiv = $("<div style='overflow-y: scroll; height: 152px; width: 300px; border: 1px solid #ccc;'></div>").appendTo(exportPopup);
                
                function addCheckbox(value, text) {
                    const checked = exportColumns.includes(value) ? "checked" : "";
                    checkboxDiv.html(checkboxDiv.html() + `<label><input type=checkbox value='${value}' ${checked}>${text}</label><br>`);
                }
                const app = {
                    id: "App Id", 
                    name: "Name",
                    label: "Label",
                    status: "Status", 
                    created: "Created Date",
                    lastUpdated: "Last Updated Date",
                    signOnMode: "Sign On Mode",
                    features: "Features",
                    "credentials.userNameTemplate.template": "Username Template",
                    "settings.app.identityProviderArn": "AWS Identity Provider ARN",
                    "settings.signOn.ssoAcsUrl": "SSO ACS URL",
                    "settings.app.postBackURL": "Post Back URL"
                };
                const defaultColumns = "id,label,name,credentials.userNameTemplate.template,features,signOnMode,status";
                const exportColumns = (localStorage.rockstarExportAppColumns || defaultColumns).replace(/ /g, "").split(",");
                for (const p in app) addCheckbox(p, app[p]);
    
                var exportArgs = localStorage.rockstarExportAppArgs || "";
                exportPopup.append(`<br><br>Query or Filter&nbsp;&nbsp;` +
                    `<a href='https://developer.okta.com/docs/reference/api/apps/#list-applications' target='_blank' rel='noopener'>Help</a><br>` +
                    `<input id=exportargs list=parlist value='${exportArgs}' style='width: 300px'><br><br>` + 
                    `<div id=error>&nbsp;</div><br>` +
                    `<datalist id=parlist><option>q=amazon_aws<option>filter=status eq "ACTIVE"<option>filter=status eq "INACTIVE"</datalist>`);
                createDivA("Export", exportPopup, function () {
                    exportArgs = $("#exportargs").val();
                    var exportHeaders = [];
                    var exportColumns = [];
                    checkboxDiv.find("input:checked").each(function () {
                        exportHeaders.push(this.parentNode.textContent);
                        exportColumns.push(this.value);
                    });
                    if (exportHeaders.length) {
                        $("#error").html("&nbsp;");
                        exportHeaders = exportHeaders.join(",");
                        localStorage.rockstarExportAppColumns = exportColumns.join(",");
                        localStorage.rockstarExportAppArgs = exportArgs;
                        startExport("Apps", `/api/v1/apps?${exportArgs}`, exportHeaders, app => toCSV(...fields(app, exportColumns)));
                    } else {
                        $("#error").html("Select at least 1 column.");
                    }
                }, "class='link-button'");
            });
        } else if (location.pathname == "/admin/access/networks") {
            createDivA("Export Networks", mainPopup, function () {
                startExport("Zones", "/api/v1/zones", "id,name,gateways,gatewayType,zoneType", 
                    zone => toCSV(zone.id, zone.name, zone.gateways && zone.gateways.map(gateway => gateway.value).join(', '), 
                        zone.gateways && zone.gateways.map(gateway => gateway.type).join(', '), zone.type));
            });
        } else if (location.pathname.match("/admin/devices-inventory")) {
            createDivA("Export Devices", mainPopup, function () {
                startExport("Devices", "/api/v1/devices", "id,displayName,platform,manufacturer,model,osVersion,serialNumber,imei,meid,udid,sid", 
                    device => toCSV(device.id, device.profile.displayName, device.profile.platform, device.profile.manufacturer, device.profile.model,
                        device.profile.osVersion, device.profile.serialNumber, device.profile.imei, device.profile.meid, device.profile.udid, device.profile.sid));
            });
        } else if (location.pathname == "/reports/user/yubikey") {
            createDivA("Export YubiKeys", mainPopup, function () {
                startExport("YubiKeys", "/api/v1/org/factors/yubikey_token/tokens?expand=user", "serial,status,id,firstName,lastName,login", 
                    token => toCSV(token.profile.serial, token.status, token._embedded && token._embedded.user.id, 
                        token._embedded && token._embedded.user.profile.firstName, token._embedded && token._embedded.user.profile.lastName, 
                        token._embedded && token._embedded.user.profile.login));
            });
        } else if (location.pathname == "/admin/universaldirectory") {
            createDivA("Export Mappings", mainPopup, function () {
                startExport("Mappings", "/api/v1/mappings", "id,sourceId,sourceName,soureceType,targetId,targetName,targetType", 
                    mapping => toCSV(mapping.id, mapping.source.id, mapping.source.name, mapping.source.type, 
                        mapping.target.id, mapping.target.name, mapping.target.type));
            });
        } else if (appId = getAppId()) {
            createDivA("Export App Users", mainPopup, function () {
                startExport("App Users", `/api/v1/apps/${appId}/users`, "id,userName,scope,externalId,firstName,lastName,syncState", 
                    appUser => toCSV(appUser.id, appUser.credentials ? appUser.credentials.userName : "", appUser.scope, appUser.externalId, 
                        appUser.profile.firstName, appUser.profile.lastName, appUser.syncState));
            });
            createDivA("Export App Groups", mainPopup, function () {
                const atos = a => a ? a.join(";") : "";
                startExport("App Groups", `/api/v1/apps/${appId}/groups?expand=group`, 
                    "id,name,licenses,roles,role,salesforceGroups,featureLicenses,publicGroups", 
                    appGroup => toCSV(appGroup.id, appGroup._embedded.group.profile.name, atos(appGroup.profile.licenses), 
                        atos(appGroup.profile.roles), appGroup.profile.role, atos(appGroup.profile.salesforceGroups), 
                        atos(appGroup.profile.featureLicenses), atos(appGroup.profile.publicGroups)));
            });
        } else if (groupId = getGroupId()) {
            createDivA("Export Group Members", mainPopup, function () {
                startExport("Group Members", `/api/v1/groups/${groupId}/users`, "id,login,firstName,lastName,status", 
                    user => toCSV(user.id, user.profile.login, user.profile.firstName, user.profile.lastName, user.status));
            });
        // TODO: what to do here?
        // } else {
        //     exportPopup = createPopup("Export");
        //     exportPopup.html("Error. Go to one of these:<br><br>" +
        //         "<a href='/admin/users'>Directory > People</a><br>" +
        //         "<a href='/admin/groups'>Directory > Groups</a><br>" +
        //         "<a href='/admin/people/directories'>Directory > Directory Integrations</a> and click on a Directory<br>" +
        //         "<a href='/admin/apps/active'>Applications > Applications</a> and click on an App<br>" +
        //         "<a href='/admin/apps/active'>Applications > Applications</a> to export Apps<br>" +
        //         "<a href='/admin/access/networks'>Security > Networks</a><br>");
        }
        function startExport(title, url, headerRow, templateCallback) {
            total = 0;
            objectType = title;
            exportPopup = createPopup(title);
            exportPopup.html("Loading ...");
            template = templateCallback;
            header = headerRow;
            lines = [];
            cancel = false;
            getJSON(url).then(getObjects).fail(failObjects);
        }
        function getObjects(objects, status, jqXHR) {
            objects.forEach(object => {
                var line = template(object);
                if (line.then) {
                    line.then(ln => lines.push(ln));
                } else {
                    lines.push(line);
                }
            });
            total += objects.length;
            exportPopup.html(total + " " + objectType + "...<br><br>");
            createDivA("Cancel", exportPopup, () => cancel = true, "class='link-button'");
            if (cancel) {
                exportPopup.parent().remove();
                return;
            }
            var link = jqXHR.getResponseHeader("Link");
            var links = link ? getLinks(link) : null;
            var paginate = false;
            if (links && links.next) {
                if (links.next.match("/users.*search=")) {
                    paginate = total < 50000; // /api/v1/users/search= only supports 50k users.
                } else {
                    paginate = true;
                }
            }
            if (paginate) {
                var nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                var url = nextUrl.pathname + nextUrl.search;
                var remaining = jqXHR.getResponseHeader("X-Rate-Limit-Remaining");
                if (remaining && remaining < 10) {
                    var intervalID = setInterval(() => {
                        exportPopup.html(exportPopup.html() + "<br>Sleeping...");
                        if ((new Date()).getTime() / 1000 > jqXHR.getResponseHeader("X-Rate-Limit-Reset")) {
                            clearInterval(intervalID);
                            getJSON(url).then(getObjects).fail(failObjects);
                        }
                    }, 1000);
                } else {
                    getJSON(url).then(getObjects).fail(failObjects);
                }
            } else {
                if (total == lines.length) {
                    downloadCSV(exportPopup, total + " " + objectType + " exported. ", header, lines, `Export ${objectType}`);
                } else {
                    exportPopup.html("Processing..."); // Wait for other fetches to finish.
                    var intervalID = setInterval(() => {
                        if (total == lines.length) {
                            downloadCSV(exportPopup, total + " " + objectType + " exported. ", header, lines, `Export ${objectType}`);
                            clearInterval(intervalID);
                        }
                    }, 300);
                }
            }
        }
        function failObjects(jqXHR) {
            exportPopup.html("<br>Error: " + jqXHR.responseJSON.errorSummary);
        }
        function fields(o, fields) {
            var a = [];
            for (var f in fields) {
                a.push(dot(o, fields[f]));
            }
            return a;
        }
        function dot(o, dots) {
            var ps = dots.split(".");
            for (var p in ps) {
                o = o[ps[p]];
                if (o == null) break;
            }
            return o;
        }
        function getAppId() {
            var path = location.pathname;
            var pathparts = path.split('/');
            if (path.match("admin/app") && (pathparts.length == 6 || pathparts.length == 7)) {
                return pathparts[5];
            }
        }
        function getGroupId() {
            var path = location.pathname;
            var pathparts = path.split('/');
            if (path.match("admin/group") && (pathparts.length == 4)) {
                return pathparts[3];
            }
        }
    }

    // User functions
    function userHome() {
        createDivA("Show SSO", mainPopup, function () {
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
                var form = ssoPopup[0].appendChild(document.createElement("form"));
                var url = form.appendChild(document.createElement("input"));
                url.style.width = "700px";
                url.placeholder = "URL";
                url.focus();
                var input = form.appendChild(document.createElement("input"));
                input.type = "submit";
                input.value = label;
                form.onsubmit = function () {
                    getSSO(url.value);
                    return false; // cancel form submit
                };
            }
            function getSSO(url) {
                ssoPopup.html("Loading ...");
                getJSON(url).then(response => {
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
        getJSON(`/api/v1/sessions/me`).then(session => {
            $(".icon-clock-light").parent().append("<div>Expires in " + Math.round((new Date(session.expiresAt) - new Date()) / 60 / 1000) + " minutes</div>");
        });
        apiExplorer();
    }

    // API functions
    function apiExplorer() {
        createDivA("API Explorer", mainPopup, function () {
            var apiPopup = createPopup("API Explorer");
            var form = apiPopup[0].appendChild(document.createElement("form"));
            form.innerHTML = "<select id=method><option>GET<option>POST<option>PUT<option>DELETE</select> " +
                "<input id=url list=apilist> "; // HACK: input.list is read-only, must set it at create time. :(
            url.style.width = "700px";
            url.placeholder = "URL";
            url.focus();
            var datalist = form.appendChild(document.createElement("datalist"));
            datalist.id = "apilist";
            const apis = "apps,apps/${appId},authorizationServers,eventHooks,features,groups,groups/${groupId},groups/${groupId}/roles,groups/rules,idps,inlineHooks,meta/schemas/user/linkedObjects,logs,mappings," + 
                "policies?type=${type},meta/schemas/user,sessions/me,templates/sms,trustedOrigins,meta/types/user,users,users/me,users/${userId},users/${userId}/factors,users/${userId}/roles,zones";
            datalist.innerHTML = apis.split(',').map(api => `<option>/api/v1/${api}`).join("") + "<option>/oauth2/v1/clients";
            var send = form.appendChild(document.createElement("input"));
            send.type = "submit";
            send.value = "Send";
            form.appendChild(document.createElement("div")).innerHTML = "<br>Body";
            var data = form.appendChild(document.createElement("textarea"));
            data.style.width = "850px";
            var results = form.appendChild(document.createElement("div"));
            form.onsubmit = function () {
                $(results).html("<br>Loading ...");
                var url = form.url.value;
                if (url.match(/\${.*}/) && location.pathname.match("/admin/(app|group|user)/")) {
                    var parts = location.pathname.split('/');
                    var id = location.pathname.match("/group/") ? parts[3] : parts[5];
                    url = url.replace(/\${.*}/, id);
                }
                requestJSON({url, method: method.value, data: data.value}).then((objects, status, jqXHR) => {
                    $(results).html("<br>");
                    var linkHeader = jqXHR.getResponseHeader("Link"); // TODO: maybe show X-Rate-Limit-* headers, too.
                    if (linkHeader) {
                        $(results).html("<br>Headers<br><table><tr><td>Link<td>" + linkHeader.replace(/</g, "&lt;").replace(/, /g, "<br>") + "</table><br>");
                        var links = getLinks(linkHeader);
                        if (links.next) {
                            var nextUrl = new URL(links.next); // links.next is an absolute URL; we need a relative URL.
                            nextUrl = nextUrl.pathname + nextUrl.search;
                        }
                    }
                    $(results).append("Status: " + jqXHR.status + " " + jqXHR.statusText + "<br>");
                    if (objects) {
                        var pathname = url.split('?')[0];
                        var json = formatPre(linkify(JSON.stringify(objects, null, 4)), pathname); // Pretty Print the JSON.
                        if (Array.isArray(objects)) {
                            var table = formatObjects(objects, pathname);
                            $(results).append(table.header);
                            if (nextUrl) {
                                createA("Next >", results, () => {
                                    form.url.value = nextUrl;
                                    send.click();
                                });
                            }
                            json = "<br>" + table.body + json;
                        }
                        $(results).append(json);
                    }
                }).fail(jqXHR => $(results).html("<br>Status: " + jqXHR.status + " " + jqXHR.statusText + "<br><br>Error:<pre>" + JSON.stringify(jqXHR.responseJSON, null, 4) + "</pre>"));
                return false; // Cancel form submit.
            };
        });
    }
    function formatJSON() {
        let pre = document.getElementsByTagName("pre")[0]; // Don't use jQuery.
        let objects = JSON.parse(pre.innerHTML);
        let json = linkify(JSON.stringify(objects, null, 4)); // Pretty Print the JSON.
        if (objects.errorCode == "E0000005") json = "Are you signed in? <a href=/>Sign in</a>\n\n" + json;
        if (Array.isArray(objects)) {
            document.head.innerHTML = "<style>body {font-family: Arial;} table {border-collapse: collapse;} tr:hover {background-color: #f9f9f9;} " +
                "td,th {border: 1px solid silver; padding: 4px;} th {background-color: #f2f2f2; text-align: left;}</style>";
            var table = formatObjects(objects, location.pathname);
            document.body.innerHTML = table.header + table.body + formatPre(json, location.pathname);
        } else {
            pre.innerHTML = json;
        }
    }
    function formatObjects(objects, url) {
        let len = "(length: " + objects.length + ")\n\n";
        let rows = [];
        let ths = [];
        objects.forEach(row => {
            for (let p in row) {
                if (!ths.includes(p)) ths.push(p);
            }
        });
        objects.forEach(row => {
            let tds = [];
            for (let p of ths) {
                if (row[p] === undefined) row[p] = "";
                if (p == "id") row[p] = "<a href='" + url + "/" + row[p] + "'>" + row[p] + "</a>";
                tds.push("<td>" + (typeof row[p] == "object" ? "<pre>" + JSON.stringify(row[p], null, 4) + "</pre>" : row[p]));
            }
            rows.push("<tr>" + tds.join(""));
        });
        return {header: "<span id=table><b>Table</b> <a href=#json>JSON</a><br><br>" + len + "</span>",
            body: "<br><table class='data-list-table' style='border: 1px solid #ddd;'><tr><th>" + ths.join("<th>") + linkify(rows.join("")) + "</table><br>" +
                "<div id=json><a href=#table>Table</a> <b>JSON</b></div><br>" + len};
    }
    function formatPre(s, url) {
        return "<pre>" + s.replace(/"id": "(.*)"/g, '"id": "<a href="' + url + '/$1">$1</a>"') + "</pre>";
    }
    function linkify(s) {
        return s.replace(/"(https.*)"/g, '"<a href="$1">$1</a>"');
    }
    /*
    // This doesn't seem to work since the new dev site went up.
    function tryAPI() {
        var baseUrl = $(".orgUrl")[0];
        if (!baseUrl || baseUrl == "https://{yourOktaDomain}") {
            //baseUrl = "https://EXAMPLE.oktapreview.com"; // TODO it should fail after, eg, 10 s and set a default.
            setTimeout(tryAPI, 1000);
            return;
        }
        baseUrl = baseUrl.innerText;
    
        // TODO: in the resulting JSON, each "id", url [etc?] should be clickable, too.
        // TODO: show HTTP response headers (need to make a new request?)
        // TODO: eg, for /api/v1/users, show q/filter/search params in a textbox.
    
        $(".api-uri-get").each(function () {
            var get = $(this);
            var url = baseUrl + get.text().replace("GET ", "").replace("${userId}", "me");
            get.parent().append(` <a href='${url}' target='_blank'>Try me -></a>`);
        });
        $(".language-sh").each(function () {
            var get = $(this);
            var curl = get.text();
            var matches;
            if (matches = curl.match(/-X GET[^]*(https.*)"/)) { // [^] matches any character, including \n. `.` does not. The /s flag will fix this, eventually.
                var url = matches[1].replace(/\\/g, "");
                get.append(` <a href='${url}' target='_blank'>Try me -></a>`);
            }
        });
    }
    */

    // Util functions
    if ($) {
        var xsrf = $("#_xsrfToken");
        if (xsrf.length) $.ajaxSetup({headers: {"X-Okta-XsrfToken": xsrf.text()}});
    }
    function createPopup(title) {
        var popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; overflow: auto; ` +
                `background-color: white; border: 1px solid #ddd;'>` +
            `<span class=title>${title}</span><div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/rockstar/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $("<div></div>").appendTo(popup);
    }
    function createA(html, parent, clickHandler) {
        createPrefixA("", html, parent, clickHandler);
    }
    function createPrefixA(prefix, html, parent, clickHandler) {
        $(`${prefix}<a style='cursor: pointer'>${html}</a>`).appendTo(parent).click(clickHandler);
    }
    function createDivA(html, parent, clickHandler, aParts = "") {
        $(`<div><a style='cursor: pointer' ${aParts}>${html}</a></div>`).appendTo(parent).click(clickHandler);
    }
    function getLinks(linkHeader) {
        var headers = linkHeader.split(", ");
        var links = {};
        for (var i = 0; i < headers.length; i++) {
            var [, url, name] = headers[i].match(/<(.*)>; rel="(.*)"/);
            links[name] = url;
        }
        return links;
    }
    function getJSON(url) {
        return $.get({url, headers});
    }
    function postJSON(settings) {
        settings.contentType = "application/json";
        settings.data = JSON.stringify(settings.data);
        settings.headers = headers;
        return $.post(settings);
    }
    function requestJSON(settings) {
        settings.contentType = "application/json";
        settings.headers = headers;
        return $.ajax(settings);
    }
    function deleteJSON(url) {
        return $.ajax({url, headers, method: "DELETE"});
    }
    function searcher(object) { // TODO: Save search string in location.hash # in URL. Reload from there.
        function searchObjects() {
            var settings = {
                url: object.url,
                data: object.data(),
                headers
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
                    if ($(".data-list-empty-msg").html() == "") {
                        $(".data-list-empty-msg").html(`<p class="data-list-empty-binary">01101110011011110111010001101000011010010110111001100111<span class="data-list-empty-img"></span></p>` +
                            `<h4 class="data-list-head data-list-empty-head">Nothing to show</h4><h5 class="data-list-head data-list-empty-head data-list-empty-subhead">Try searching or filtering</h5>`);
                    }
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
        });
    }
    function toCSV(...fields) {
        return fields.map(field => `"${field == undefined ? "" : field.toString().replace(/"/g, '""')}"`).join(',');
    }
    function downloadCSV(popup, html, header, lines, filename) {
        popup.html(html + "Done.");
        var a = $("<a>").appendTo(popup);
        a.attr("href", URL.createObjectURL(new Blob([header + "\n" + lines.join("\n")], {type: 'text/csv'})));
        var date = (new Date()).toISOString().replace(/T/, " ").replace(/:/g, "-").substr(0, 19);
        a.attr("download", `${filename} ${date}.csv`);
        a[0].click();
    }
})();
