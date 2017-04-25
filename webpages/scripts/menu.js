var lightBlue = "#90baef";
var lastMenuHdrId;

function dropDownMenu(c, url, i) {
    var noborder = "1px solid white";
    c.id = "mh" + i;
    c.onmouseover = function () {
        this.style.border = "1px solid " + lightBlue;
        this.firstChild.nextSibling.style.backgroundColor = lightBlue;
        this.firstChild.nextSibling.firstChild.style.visibility = "visible";
    };
    c.onmouseout = function () {
        this.style.border = noborder;
        this.firstChild.nextSibling.style.backgroundColor = "";
        this.firstChild.nextSibling.firstChild.style.visibility = "hidden";
    };
    function c_onclick(event) {
        var target = event.target ? event.target : event.srcElement;
        if (target.tagName == "TD") menuHdrClick(target.id, target.url); // event is "attached" to c, but clicking a child will raise it too.
    } // in FF, c.onclick was getting the event before menu.click
    if (c.addEventListener) {
        c.addEventListener("click", c_onclick, false); // FF
    } else {
        c.attachEvent("onclick", c_onclick); // IE
    }
    c.url = url;
    c.style.border = noborder; // Initialize cell.
}

function menuHdrClick(menuHdrId, url) {
    var menuHdr = document.getElementById(menuHdrId);
    var menuId = menuHdrId + "DropDownMenu", menu = document.getElementById(menuId);
    if (menu) {
        menuHdr.removeChild(menu);
        lastMenuHdrId = "";
    } else {
        if (lastMenuHdrId) hideMenu(lastMenuHdrId);
        showMenu(menuHdr, menuId, url);
        lastMenuHdrId = menuHdrId;
    }
}

function showMenu(menuHdr, menuId, url) {
    var menuItems = 
        menuItem(action("Open in New Window", url, menuHdr.id)) +
        menuItem(action("Delete", url, menuHdr.id, "<img src=images/delete.gif border=0> Delete")) +
        "";

    function action(name, url, id, text) {
        return link('javascript:actionClick("' + name + '", "' + url + '", "' + id + '")', text || name);
    }

    function link(href, text) {
        return "<a href='" + href + "' style='color: black; display: block; text-decoration: none'>" + text + "</a>";
    }

    function menuItem(item) {
        return "<div onmouseover='this.style.backgroundColor=\"" + lightBlue + "\"' onmouseout='this.style.backgroundColor=\"white\"'>" + 
               item + "</div>";
    }

    function getPos(el) {
        var pos = {left: 0, top: 0};
        while (el.offsetParent) {
            pos.left += el.offsetLeft;
            pos.top += el.offsetTop;
            el = el.offsetParent;
        }
        return pos;
    }

    var menu = menuHdr.appendChild(document.createElement("div"));
    menu.id = menuId;
    var menuHdrPos = getPos(menuHdr);
    menu.style.left = menuHdrPos.left + "px";
    menu.style.top = menuHdrPos.top + menuHdr.offsetHeight + "px";
    menu.style.width = menuHdr.offsetWidth + "px";
    menu.style.border = "1px solid";
    menu.style.position = "absolute";
    menu.style.zIndex = 1010;
    menu.style.backgroundColor = "white"; // defaults to "transparent"
    menu.style.color = "black"; // sets border color
    menu.style.padding = "4px";

    menu.innerHTML = menuItems;
}

function actionClick(action, url, id) {
    switch (action) {
      case "Open in New Window":
        window.open(url, "_blank");
        break;
      case "Delete":
        deleteFile(url);
        break;
      default:
        alert("menu.js/actionClick('" + action + "'): unknown action.");
    }
    hideMenu(id);
}

function hideMenu(id) {
    menuHdrClick(id);
}
