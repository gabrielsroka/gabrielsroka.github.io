/// <reference path="js.js" />

// Copyright 2008-2012 Gabriel Sroka

function createTable(headers, items, path) {
/// <summary>Create an HTML Table Element.</summary>
/// <param name="headers" type="Array" elementType="Header">Can have .sortable (Boolean) property.</param>
/// <param name="items" type="[{rowId}]">Should have .addRows(table) method.</param>
/// <returns type="Element">New HTML Table Element.</returns>

    var table, tbody, hdrRow, hdrId = "hdr";
    path = path || "";

    function sortRows(sortBy) {
        function defaultComparer(o1, o2) {
            if (headers[headers.sortBy].comparer) {
                return headers[headers.sortBy].comparer(o1, o2, headers.sortAsc);
            } else {
                return objectPropertyComparer(o1, o2, headers[headers.sortBy].property, headers.sortAsc);
            }
        }

        var sortByOld = headers.sortBy;
        headers.sortBy = sortBy;
        var caretImg = "<img src='" + path + "images/caret_" + (headers.sortAsc ? "up" : "down") + ".gif' width='7' height='7'>";
        if (sortBy != sortByOld) hdrRow.cells[sortByOld].innerHTML = headers[sortByOld].text;
        hdrRow.cells[sortBy].innerHTML = headers[sortBy].text + " " + caretImg;
        items.sort(defaultComparer);
        if (tbody.rows.length == 0) {
           items.addRows(table);
        } else {
            for (var i = items.length - 1; i > 0; i--) { // insertBefore requires that items are moved in reverse order.
                tbody.insertBefore(document.getElementById(items[i - 1].rowId), document.getElementById(items[i].rowId));
            }
        }
    }

    function hdr_onclick() {
        var sortBy = this.id.substr(hdrId.length); // Remove hdrId to get sortBy.
        if (headers.sortBy == sortBy) {
            headers.sortAsc = !headers.sortAsc;
        } else {
            headers.sortAsc = true;
        }
        sortRows(sortBy);
    }

    function hdr_onmousewheel(event) {
        var sortAsc = event.detail ? event.detail < 0 : event.wheelDelta > 0; // Use .wheelDelta in IE/WebKit.
        var target = event.target ? event.target : event.srcElement;
        if (!target.id) target = target.parentNode;
        var sortBy = target.id.substr(hdrId.length); // Remove hdrId to get sortBy.
        if (headers.sortAsc != sortAsc || headers.sortBy != sortBy) {
            headers.sortAsc = sortAsc;
            sortRows(sortBy);
        }
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }

    table = document.createElement("table");
    tbody = table.appendChild(document.createElement("tbody"));

    hdrRow = table.createTHead().insertRow(-1);
    hdrRow.className = "hdr";
    for (var h = 0, c; h < headers.length; h++) {
        c = hdrRow.insertCell(-1);
        c.innerHTML = headers[h].text;
        c.colSpan = headers[h].colSpan;
        headers[h].id = hdrId + h;
        c.id = headers[h].id;
        if (headers.sortable) {
            c.onclick = hdr_onclick;
            handleMousewheel(c, hdr_onmousewheel);
            c.style.cursor = "pointer";
            c.className = "sortableHdr";
        }
    }
    if (!items.addRows) {
        items.addRows = function () {
            for (var i = 0; i < items.length; i++) {
                var row = table.tBodies[0].insertRow(-1);
                var item = items[i];
                item.rowId = "i" + i; // Add short, unique id.
                row.id = item.rowId;
                for (var h = 0; h < headers.length; h++) {
                    row.insertCell(-1).innerHTML = item[headers[h].property];
                }
            }
        };
    }
    if (headers.sortable) {
        headers.sortAsc = true;
        if (!headers.sortBy) headers.sortBy = 0;
        sortRows(headers.sortBy);
    } else {
        items.addRows(table);
    }
    return table;
}

function Header(text, property, comparer, colSpan) {
/// <summary>Header constructor.</summary>
/// <param name="text" type="String">Header display text.</param>
/// <param name="property" type="String">Name of object's property.</param>
/// <param name="comparer" type="Function">Can be called from anArray.sort(comparer). optional--defaults to defaultComparer.</param>
/// <param name="colSpan" type="Number"></param>
/// <returns type="Header">New Header object.</returns>

    this.text = text;
    this.property = property;
    this.comparer = comparer;
    this.colSpan = colSpan || 1;
}

Header.prototype.toString = function () { // Can be used by headers.join().
    return this.text;
};
