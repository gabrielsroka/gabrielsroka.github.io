(function () {
  var ts = document.getElementsByTagName("table");
  for (var t = 0; t < ts.length; t++) {
    var at = ts[t];
    at.style.width = '100%';
    if (at.className == "listtable") {
      for (var r = 0; r < at.rows.length; r++) {
        var ar = at.rows[r];
        for (var c = 1; c < ar.cells.length;c++) {
          var ac = ar.cells[c];
          var h = ac.innerHTML;
          var t = '" target="_blank">';
          if (c == 1) h = h.replace(/">/, t);
          ar.cells[0].innerHTML += "<br>" + h;
          ac.innerHTML = "";
        }
        ar.cells[0].style.fontSize = "1em";
        ar.cells[0].style.width = "100%";
      }
    }
  }
}
)();
