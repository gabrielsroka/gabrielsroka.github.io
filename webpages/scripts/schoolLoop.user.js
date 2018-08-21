/// <reference path="jquery-1.3.2-vsdoc2.js" />

// ==UserScript==
// @name           School Loop Plus
// @namespace      https://gabrielsroka.github.io/
// @description    Show progress reports on main portal page. Add course title to progress report. Enable autocomplete on login. Sort locker by date. Highlight today in month. Show whether sent messages have been read.
// @version        2012.4.20.1655
// @include        http*://lbrogers.schoolloop.com/
// @include        http*://lbrogers.schoolloop.com/portal/index*
// @include        http*://lbrogers.schoolloop.com/mobile/index*
// @include        http*://lbrogers.schoolloop.com/progress_report/report*
// @include        http*://lbrogers.schoolloop.com/portal/login*
// @include        http*://lbrogers.schoolloop.com/cms/page_view?*
// @include        http*://lbrogers.schoolloop.com/cms/month?*
// @include        http*://lbrogers.schoolloop.com/calendar/month*
// @include        http*://lbrogers.schoolloop.com/loopmail/outbox*

// @require        https://gabrielsroka.github.io/webpages/scripts/FTClient.js
// @require        http://cdn.schoolloop.com/1201171230/static/lib/jquery_old/1.3/jquery-1.3.2.min.js
// ==/UserScript==


(function () {
    // Show progress reports on main portal page.
    if (!location.href.match("lbrogers.schoolloop.com/((portal|mobile)/index.*)?$")) return;
    function insertRow(courseId, assignmentId, assignment) {
        var sql = "insert into " + sessionStorage.getItem("tableId") + " (CourseId, AssignmentId, Assignment) " + // , Score, Percent, Grade, Comment
                  "values ('" + courseId + "', '" + assignmentId.replace(/'/g, "\\'") + "', '" + assignment.replace(/'/g, "\\'") + "')"; // , '', '', '', ''
        ftClient.query(sql);
        sessionStorage.setItem(courseId + ":" + assignmentId, assignment)
    }
    var token = sessionStorage.getItem("token");
    if (token) {
        var ftClient = new ClientLoginFTClient(token);
        var sql = "select RowId, CourseId, AssignmentId, Assignment from " + sessionStorage.getItem("tableId");
        var table = ftClient.query(sql);
        for (var r = 0; r < table.rows.length; r++) {
            var row = table.rows[r];
            sessionStorage.setItem(row[1] + ":" + row[2], row[3]);
        }
    }
    $("#page_title").after($("<div>").append($("table.hub_general:contains(Course:)"))).append("<div id='report'>"); // Move course table up to a wider spot.
    $("a[href*=progress_report]").each(function () {
        var a = this; // this won't make it into inner function, but a will.
        $.get(this.href, function (responseText) {
            $("#report").hide().html(responseText);
            var assTable = $("table.general:contains(Assignment:)").removeClass("general"); // Remove .general so you won't find it on next iteration.
            var courseId = assTable.prev().find("span.label1").html().replace(/:/, "");
            var tr = $(a).parent().parent();
            var assCol = 2, startCol = 3;
            if (document.title.match(/Mobile/)) {
                tr = tr.parent();
                assCol = 0;
                startCol = 1;
            }
            tr.click(function () { assTable.parent().toggle(); }).css({ cursor: "pointer" }).after($("<tr>").append($("<td colspan='5'>").hide().append(assTable)));
            for (var r = 1; r < assTable[0].rows.length; r++) { // Skip header row.
                var row = assTable[0].rows[r];
                var ch = row.cells[assCol].innerHTML;
                var assId = ch.replace(/^\s*|\s*$/g, "");
                var ps = ch.match(/id=(\d*).*>(.*)</);
                if (ps) {
                    assId = ps[1];
                    ch = ps[2];
                }
                var ass = "";
                for (var c = startCol; c < row.cells.length - 1; c++) {
                    ch = row.cells[c].innerHTML;
                    ps = ch.replace(/\n/g, "").match(/>(.*)</);
                    if (ps) ch = ps[1];
                    ass += ch.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/^\s*|\s*$/g, "") + ",";
                }
                if (location.href.match(/#all$/)) insertRow(courseId, assId, ass); // Save all.
                if (sessionStorage.getItem(courseId + ":" + assId) != ass) {
                    $(row).bind("click", { courseId: courseId, assId: assId, ass: ass, className: row.className }, function (event) {
                        insertRow(event.data.courseId, event.data.assId, event.data.ass);
                        $(this).find("td").css({ backgroundColor: "" });
                        this.className = event.data.className;
                    }).removeClass("highlight").find("td").css({ backgroundColor: "#ffffbb", cursor: "pointer" });
                    assTable.parent().show();
                }
            }
            if (assTable.is(":visible")) a.innerHTML += " <img src='https://cdn.schoolloop.com/1201171230/img/new.gif'>";
            assTable.find("th.list_label:contains(Submitted Work:)").removeClass("list_label");
        });
    });

    var news = $("table.module:contains(News)");
    news.add(news.next()).insertBefore($("table.module:contains(My Students)")); // .next().andSelf() returns elements in reverse order in jQuery 1.3.
    var schedule = $("table.module:contains(Schedule)");
    schedule.add(schedule.next()).insertBefore(news);
}
)();

(function () {
    // Enable autocomplete on login. Login to Google Fusion Tables.
    if (!location.href.match(/login|portal/)) return;
    var form = document.getElementById("form");
    if (form) {
        form.autocomplete = "on";
        var ftusername = document.getElementsByName("password")[0].parentNode.appendChild(document.createElement("input"));
        ftusername.className = "Text";
        ftusername.value = "Google Username";
        var ftpassword = document.getElementsByName("password")[0].parentNode.appendChild(document.createElement("input"));
        ftpassword.type = "password";
        ftpassword.className = "Text";
        if (!sessionStorage.getItem("token")) {
            $(form).submit(function () {
                var token = clientLogin(ftusername.value, ftpassword.value);
                if (!token) {
                    alert("Incorrect Google username/password.");
                    ftusername.focus();
                    return false;
                }
                sessionStorage.setItem("token", token);
                var ftClient = new ClientLoginFTClient(token);
                if (!sessionStorage.getItem("tableId")) {
                    var table = ftClient.query("show tables");
                    for (var r = 0; r < table.rows.length; r++) {
                        if (table.rows[r][1] == "School Loop Assignments") {
                            sessionStorage.setItem("tableId", table.rows[r][0]);
                            break;
                        }
                    }
                }
            });
        }
    }
}
)();

$("a:contains(Rogers Middle School Home)").attr({ rel: "" }); // Kill onmouseover menu.

(function () {
    // Show whether sent messages have been read.
    if (location.href.indexOf("loopmail/outbox") < 0) return;
    $("a.round_button").after($("<a class='round_button'>Read?</a>").click(function () {
        $("a[href*=loopmail/view]").each(function () {
            var a = this; // this won't make it into inner function, but a will.
            $.get(this.href, function (responseText) {
                if (responseText.match(/checkmark/)) a.innerHTML += " <img src='https://cdn.schoolloop.com/1203200925/img/checkmark.png'>"
            });
        });
    }));
}
)();

(function () {
    // Add course title to progress report.
    if (location.href.indexOf("progress_report") < 0) return;
    document.title = $("span.label1").html().replace(/Accelerated/, "Accel") + " " + document.title;
}
)();

(function () {
    // Sort locker by date.
    if (location.href.indexOf("page_view") < 0) return;
    function caretImg(asc) {
        return "<img src='https://gabrielsroka.github.io/webpages/images/caret_" + (asc == 1 ? "up" : "down") + ".gif' width='7' height='7'>";
    }
    var tables = document.getElementsByTagName("table");
    for (var t = 0; t < tables.length; t++) {
        var table = tables[t];
        if (table.rows.length > 2) {
            var rows = [];
            for (var r = 0; r < table.rows.length; r++) {
                var row = table.rows[r], date = /\d{1,2}\/\d{1,2}\/\d{2,4}/.exec(row.innerHTML);
                if (date) {
                    row.date = new Date(date[0]);
                    rows.push(row);
                }
            }
            if (rows.length) {
                var hdrRow = table.createTHead().insertRow(-1);
                hdrRow.insertCell(-1).innerHTML = "&nbsp;Date " + caretImg(1) + caretImg(-1);
                hdrRow.style.backgroundColor = "#cdcdcd";
                hdrRow.tbody = table.tBodies[0];
                hdrRow.rows = rows;
                hdrRow.asc = 1;
                hdrRow.onclick = function () {
                    var _this = this;
                    this.rows.sort(function (row1, row2) { return _this.asc * (row2.date - row1.date); });
                    for (var r = this.rows.length - 1; r > 0; r--) {
                        this.tbody.insertBefore(this.rows[r - 1], this.rows[r]);
                    }
                    this.asc *= -1;
                    this.cells[0].innerHTML = "&nbsp;Date " + caretImg(this.asc);
                };
            }
        }
    }
}
)();

(function () {
    // Highlight today in month.
    if (location.href.indexOf("month") < 0) return;
    var spans = document.getElementsByTagName("span");
    for (var s = 0; s < spans.length; s++) {
        if (spans[s].style.color == "rgb(170, 0, 0)") {
            spans[s].parentNode.parentNode.parentNode.style.backgroundColor = "#ffffbb";
            break;
        }
    }
}
)();


//old

//    document.cookies = function() {
//        var cs = document.cookie.split("; "), cookies = {};
//        for (var c = 0; c < cs.length; c++) {
//            var eq = cs[c].indexOf("="); // cookie.split("=") will return too many pieces if there are "=" in the value. we want 2 pieces: name and value.
//            var name = cs[c].substr(0, eq), value = cs[c].substr(eq + 1);
//            cookies[name] = value;
//        }
//        return cookies;
//    };
//    var cookies = document.cookies(), now = new Date();
//    var lastPortal = cookies.lastPortal ? new Date(cookies.lastPortal) : new Date(now.getFullYear() + 1, now.getMonth(), 1);

//            var dateParts = responseText.match(/Grade Last Published.*?(\d{1,2}\/\d{1,2})\/(\d{2}) (\d{1,2}:\d{2} [AP]M)/);
//            var md = dateParts[1], yy = dateParts[2], time = dateParts[3];
//            var newImg = (new Date(md + "/20" + yy + " " + time) > lastPortal) ? " <img src=https://cdn.schoolloop.com/1201171230/img/new.gif>" : "";
//            a.innerHTML += " - " + md + newImg;
//            a.title = "Published: " + time;

//    $("a:contains(Logout)").click(function() {
//        document.cookie = "lastPortal=" + now.toDateString() + " " + now.toLocaleTimeString() + "; path=/; expires=" + new Date(now.getFullYear() + 1, now.getMonth(), 1);
//    });
//    $("a:contains(Accelerated)").each(function() {
//        this.innerHTML = this.innerHTML.replace(/Accelerated/, "Accel");
//    });
//    if (cookies.lastPortal) $("span:contains(/)").html("Last visit: " + cookies.lastPortal).removeClass("off");


function sans_jQuery() {
    //    var as = document.getElementsByTagName("a");
    //    for (var a = 0; a < as.length; a++) {
    //        if (as[a].href.indexOf("progress_report") > 0) {
    //            request(as[a]);
    //        } else if (as[a].innerHTML.indexOf("Accelerated") > 0) {
    //            as[a].innerHTML = as[a].innerHTML.replace(/Accelerated/, "Accel");
    //        } else if (as[a].innerHTML == "Logout") {
    //            as[a].onclick = function() {
    //                document.cookie = "lastPortal=" + now.toDateString() + " " + now.toLocaleTimeString() + "; path=/; expires=" + new Date(now.getFullYear() + 1, now.getMonth(), 1);
    //            };
    //        }
    //    }



    //    var spans = document.getElementsByTagName("span");
    //    for (var s = 0; s < spans.length; s++) {
    //        if (spans[s].innerHTML.match(/\d{1,2}\/\d{1,2}\/\d{2}/)) {
    //            spans[s].innerHTML = "Last visit: " + cookies.lastPortal;
    //            break;
    //        }
    //    }



    //    var ts = document.getElementsByTagName("table");
    //    for (var t = 0; t < ts.length; t++) {
    //        if (ts[t].innerHTML.indexOf("My Students") > 0) var students = ts[t];
    //        if (ts[t].innerHTML.indexOf("Schedule") > 0) var schedule = ts[t];
    //    }
    //    var space = schedule.nextSibling.nextSibling;
    //    students.parentNode.insertBefore(space, students);
    //    students.parentNode.insertBefore(schedule, space);
}



//function request(method, sql, onload) {
//    var fusionUrl = "https://fusiontables.googleusercontent.com/fusiontables/api/query?jsonCallback=callback";
//    var details = {
//        method: method,
//        url: fusionUrl,
//        synchronous: true,
//        headers: {
//            "Authorization": "GoogleLogin auth=" + sessionStorage.getItem("auth")
//        }
//    };
//    if (method == "POST") {
//        details.headers["Content-Type"] = "application/x-www-form-urlencoded";
//        details.data = "sql=" + encodeURIComponent(sql);
//    } else {
//        details.url += "&encid=true&sql=" + encodeURIComponent(sql); // show tables, select, and describe
//    }
//    var response = GM_xmlhttpRequest(details);
//    function callback(json) {
//        // json = { "table": { "cols": ["rowid"], "rows": [["123"]]} }
//        onload(json.table);
//    }
//    //if (sql.substr(0, 6) == "update") alert(response.responseText);
//    var OK = 200;
//    if (response.status == OK) {
//        eval(response.responseText);
//    } else {
//        alert(response.responseText);
//    }
//}

//function selectRows(courseId, assignmentId) {
//    var sql = "select RowId, CourseId, AssignmentId, Assignment from " + sessionStorage.getItem("tableId") + " " +
//              "where CourseId = '" + courseId + "' and AssignmentId = '" + assignmentId.replace(/'/g, "\\'") + "'";
//    var rows;
//    request("GET", sql, function (table) {
//        rows = table.rows;
//    });
//    return rows;
//}

//function insertRow(courseId, assignmentId, assignment) {
//    var sql = "insert into " + sessionStorage.getItem("tableId") + " (CourseId, AssignmentId, Assignment) " + // , Score, Percent, Grade, Comment
//              "values ('" + courseId + "', '" + assignmentId.replace(/'/g, "\\'") + "', '" + assignment.replace(/'/g, "\\'") + "')"; // , '', '', '', ''
//    request("POST", sql, function (table) {
//        //alert(table.rows.length + " assignment saved.");
//    });
//}
//function updateRows(courseId, assignmentId, assignment) {
//    var sql = "update " + sessionStorage.getItem("tableId") + " set Assignment='7' " +
//              "where RowId = '187'";
//    request("POST", sql, function () {
//        // No table is returned on update.
//    });
//}
