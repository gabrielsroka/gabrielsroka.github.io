/// <reference path="table.js" />

// Copyright 2008-2010 Gabriel Sroka

function showDialog(text, toolbar, headers, items, cancelCallback, path) {
/// <summary>Show a Dialog Box.</summary>
/// <param name="text" type="String">Dialog text.</param>
/// <param name="toolbar" type="String">Optional Toolbar HTML.</param>
/// <param name="headers" type="[Header]">Can have .sortable (Boolean) property.</param>
/// <param name="items" type="[{rowId}]">Should have .addRows(table) method.</param>
/// <param name="cancelCallback" type="Function">Function to call if user clicks Cancel button.</param>
/// <param name="path" type="String">Path to images.</param>
/// <returns type="Element">New HTML Table Element.</returns>

    function document_onkeydown(event) {
        var keyEsc = 27;
        event = window.event || event;
        if (event.keyCode == keyEsc) {
            cancelCallback();
        }
    }

    var dialogId = "dialog";
    if (document.getElementById(dialogId)) return;
    var dialog = document.body.appendChild(document.createElement("table"));
    dialog.insertRow(-1).insertCell(-1).innerHTML = "<table align=center><td id=tableData>";
    dialog.id = dialogId;
    dialog.style.position = "absolute";
    dialog.style.top = "0px";
    dialog.style.width = "99%";
    dialog.style.height = document.body.parentNode.clientHeight + "px";
    dialog.style.zIndex = 1000;
//    dialog.style.backgroundColor = "gray"; // defaults to "transparent"

    var div = document.getElementById("tableData").appendChild(document.createElement("div"));
    div.style.border = "2px solid";
    div.style.backgroundColor = "white"; // defaults to "transparent"

    var table = createTable(headers, items, path);

    var r = table.createTHead().insertRow(0);
    var c = r.insertCell(-1);
    c.innerHTML = text;
    c.style.backgroundColor = "#709ad1";
    c = r.insertCell(-1);
    c.colSpan = Math.max(headers.length - 1 + headers[0].colSpan - 1, 1);
    c.style.textAlign = "right";
    c.innerHTML = toolbar + "&nbsp;";
    var b = c.appendChild(document.createElement("button"));
    b.accessKey = "C";
    b.innerHTML = "<u>C</u>ancel";
    b.onclick = cancelCallback;

    div.appendChild(table);
    b.focus();

    document.onkeydown = document_onkeydown;
    div.appendChild(document.createElement("br"));
    
    dialog.makeDraggable = function () {
        function x(event) {
            return event ? event.pageX : window.event.clientX;
        }
        
        function y(event) {
            return event ? event.pageY : window.event.clientY;
        }
    
        this.dragging = false;
        this.dragStart = function (x, y) {
            this.dragging = true;
            this.dragX = x - parseInt(this.offsetLeft);
            this.dragY = y - parseInt(this.offsetTop);
        };
        this.drag = function (x, y) {
            this.style.left = (x - this.dragX) + "px";
            this.style.top = (y - this.dragY) + "px";
        };
        this.dragStop = function () {
            this.dragging = false;
        };
        this.onmousedown = function (event) {
            dialog.dragStart(x(event), y(event));
        };
        this.onmouseup = function (event) {
            dialog.dragStop();
        };
        this.onmousemove = function (event) {
            if (dialog.dragging) {
                dialog.drag(x(event), y(event));
            }
        };
    };
    
    dialog.hide = function () {
        document.body.removeChild(this);
        document.onkeydown = null;
    };
    dialog.headers = headers;

    return dialog;
}
