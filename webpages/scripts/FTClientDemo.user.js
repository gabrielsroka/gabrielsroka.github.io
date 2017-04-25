// ==UserScript==
// @name           Greasemonkey/IE Google Fusion Tables Demo
// @namespace      http://webpages.charter.net/gabrielsroka
// @description    Greasemonkey/IE Google Fusion Tables Demo
// @version        2012.4.19.1700
// @include        http://webpages.charter.net/gabrielsroka/GMFTClientDemo.htm
// @require        http://webpages.charter.net/gabrielsroka/scripts/FTClient.js
// ==/UserScript==

document.getElementById("username").focus();

document.getElementById("form").onsubmit = function () {
    var results = document.getElementById("results");
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var token = clientLogin(username, password);
    if (!token) {
        results.innerHTML = "Google login error.";
        return false;
    }
    var ftClient = new ClientLoginFTClient(token);
    Array.prototype.toHTML = function (tag) {
        return tag + this.join(tag);
    };
    function toHTML(table, caption) {
        if (!table.cols) return table;
        for (var r = 0; r < table.rows.length; r++) {
            table.rows[r].toString = function () {
                return this.toHTML("<td>");
            }
        }
        return "<table><caption>" + caption + "</caption><tr>" + table.cols.toHTML("<th>") + table.rows.toHTML("<tr>") + "</table>";
    }
    results.innerHTML = "Results<br>";

    // show tables
    var table = ftClient.query("show tables");
    results.innerHTML += toHTML(table, "show tables") + "<br>";

    // create a table
    table = ftClient.query("create table demoTable (strings:string, numbers:number, locations:location)");
    var tableId = table.rows[0][0];
    results.innerHTML += toHTML(table, "create table") + "<br>";

    // insert row into table
    table = ftClient.query("insert into " + tableId + " (strings, numbers, locations) values ('mystring', 12, 'Palo Alto, CA')");
    var rowId = table.rows[0][0];
    results.innerHTML += toHTML(table, "insert row") + "<br>";

    // show row
    table = ftClient.query("select rowId, strings, numbers, locations from " + tableId + " where numbers=12");
    results.innerHTML += toHTML(table, "show row") + "<br>";

    // update row
    ftClient.query("update " + tableId + " set strings = 'mystring2' where rowId = '" + rowId + "'");
    table = ftClient.query("select * from " + tableId);
    results.innerHTML += toHTML(table, "update row") + "<br>";

    // delete row
    table = ftClient.query("delete from " + tableId + " where rowId = '" + rowId + "'");

    // drop table
    table = ftClient.query("drop table " + tableId);

    
    return false; // Cancel form.submit().
};
