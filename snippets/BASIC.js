// 10:10 - 10:40
// 9:30 - 

/*
REM BASIC IS AWESOME
J = 1
FOR I = 1 TO 10
  IF J = 0 THEN
    PRINT I
    J = 1
  ELSE
    J = 0
  END IF
NEXT I
*/

runBookmarklet = function run() {
    debug.clear();
    console.clear();
    var prog = taEdit.value;
    var lines = prog.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.startsWith("FOR")) {
            v = line[4];
            line = line
                .replace("FOR", "for (var")
                .replace(" TO", "; " + v + " <=") +
                "; " + v + "++) {";
        } else if (line.startsWith("PRINT")) {
            line = line.replace("PRINT ", "print(") + ");";
        } else if (line.startsWith("NEXT")) {
            line = "}";
        } else if (line.startsWith("IF")) {
            line = line
                .replace("IF ", "if (")
                .replace(" THEN", ") {")
                .replace("=", "==");
        } else if (line.startsWith("ELSE")) {
            line = line.replace("ELSE", "} else {");
        } else if (line.startsWith("END IF")) {
            line = "}";
        } else if (line.startsWith("REM")) {
            line = line.replace("REM", "//");
        } else {
            line += ";";
        }
        lines[i] = line;
    }
    lines = lines.join('\n');
    console.log(lines);
    eval(lines);
};

function print(...args) {
    debug.print(args.join("  "));
}
