(function () {
    // converts JavaScript to 6502 asm
    // for https://skilldrick.github.io/easy6502/simulator
    function source () {
        const width = 0x05
        const height = 0x05
        const nextrow = 0x20
        const offset = 0x21 // nextrow + 1, down 1 px, right 1 px
        const charspacing = 0x66 // 0x20 * 0x03 + 0x06 == nextrow * (8 - height) + (width + 1)
        const screenStartHi = 0x02 // 0x0200 to 0x05ff, 32 px * 32 px, 4 pages each 8 px tall
        const color = 0x0a // red

        var screen // lo
        var page = screenStartHi // hi
        var iChars = height
        var iLine
        var iChar
        var pixels

        main()

        function main() {
            x = 0x00 // index to chars
            for (iLine = 0x04; iLine > 0x00; iLine--) {
                printLine()
                page++
            }
        }

        function printLine() {
            screen = offset
            for (iChar = 0x05; iChar > 0x00; iChar--) {
                printChar()
                iChars += height
                screen += charspacing
            }
        }

        function printChar() {
            for (x = x; x < iChars; x++) {
                pixels = chars [x]
                a = color
                for (y = 0x00; y < width; y++) {
                    pixels <<= 1 // sets c
                    if (c == 1) {
                        indirect(screen + y) = a
                    }
                }
                screen += nextrow
            }
        }

        const chars = [
            0x70,0x80,0x98,0x88,0x70, // G
            0x70,0x88,0xf8,0x88,0x88, // A
            0x88,0xd8,0xa8,0x88,0x88, // M
            0xf8,0x80,0xf0,0x80,0xf8, // E
            0x00,0x00,0x00,0x00,0x00, // space

            0x70,0x88,0x88,0x88,0x70, // O
            0x88,0x88,0x50,0x50,0x20, // V
            0xf8,0x80,0xf0,0x80,0xf8, // E
            0xf0,0x88,0xf0,0x90,0x88, // R
            0x20,0x20,0x20,0x00,0x20, // !

            0xf0,0x88,0xf0,0x88,0xf0, // B
            0x70,0x88,0x80,0x88,0x70, // C
            0xf0,0x88,0x88,0x88,0xf0, // D
            0xf8,0x80,0xf0,0x80,0x80, // F
            0x88,0x88,0xf8,0x88,0x88, // H

            0x70,0x20,0x20,0x20,0x70, // I
            0x7e,0x08,0x08,0x48,0x30, // J
            0x48,0x50,0x60,0x50,0x48, // K
            0x80,0x80,0x80,0x80,0xf0, // L
            0x88,0xc8,0xa8,0x98,0x88, // N
        ]
    }

    var dest = [];
    var cmds = [];
    var consts = [];
    var vars = 0;

    function isConst(s) {
        return (consts.includes(s) || s[0] == "$") ? "#" + s : s;
    }

// TODO: use 0xFF instead of $FF ?
// TODO: add: and, jmp (endless loop), cmp, beq, bit, txa, bpl, bcs, sbc, nop, (add,x), lsr, dex, sec
    var lines = source.toString().replace(/0x/g, "$").split("\n");
    for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        var tokens = line.split(" ");
        if (tokens[0] == "var") {
            dest.push("define " + tokens[1] + " $" + vars++);
            if (tokens[2] == "=") {
                dest.push("  lda " + isConst(tokens[3]));
                dest.push("  sta " + tokens[1]);
            }
        } else if (tokens[0] == "const") {
            if (tokens[3] == "[") {
                dest.push(tokens[1] + ":");
                while (true) {
                    line = lines[++i].trim();
                    if (line == "]") break;
                    dest.push(line ? "  dcb " + line.replace("//", ";") : "");
                }
            } else {
                dest.push(line.replace("const", "define").replace(" =", ""));
                consts.push(tokens[1]);
            }
        } else if (tokens[0] == "break") {
            dest.push("  brk");
        } else if (tokens[0].match(/^[axy]$/)) {
            dest.push("  ld" + tokens[0] + " " + isConst(tokens[2]));
        } else if (tokens[1] == "<<=") {
            dest.push("  rol " + tokens[0]);
        } else if (tokens[0] == "function") {
            dest.push(tokens[1].replace("()", "") + ":");
            cmds.push("  rts");
        } else if (tokens[0].startsWith("indirect")) {
            dest.push("  st" + tokens[4] + " " + tokens[0].substring(8) + ")," + tokens[2][0]);
        } else if (tokens[0].endsWith("()")) {
            dest.push("  jsr " + tokens[0].replace("()", ""));
            if (tokens[0].startsWith("main")) {
                dest.push("  brk");
            }
        } else if (tokens[0] == "for") {
            let forVar = tokens[1].substring(1);
            let label = forVar + "Loop";
            let init = tokens[3].substring(0, tokens[3].length - 1);
            let cond = tokens[6].substring(0, tokens[6].length - 1);
            if (forVar.match(/^[xy]$/)) {
                if (forVar != init) {
                    dest.push("  ld" + forVar + " #" + init);
                }
                dest.push(label + ":");
                cmds.push("  in" + forVar + "\n" +
                          "  cp" + forVar + " " + isConst(cond) + "\n" +
                          "  bne " + label);
            } else {
                dest.push("  lda " + isConst(init));
                dest.push("  sta " + forVar);
                dest.push(label + ":");
                cmds.push("  dec " + forVar + "\n" +
                          "  bne " + label);
            }
        } else if (tokens[0] == "if") {
            if (tokens[1] == "(c" && tokens[2] == "==" && tokens[3] == "1)") {
                dest.push("  bcc onCC");
                cmds.push("onCC:");
            }
        } else if (tokens[0] == "}") { // end for, end if, end function
            dest.push(cmds.pop());
        } else if (tokens[0].endsWith("++")) {
            dest.push("  inc " + tokens[0].replace("++", ""));
        } else if (tokens[0].endsWith("--")) {
            dest.push("  dec " + tokens[0].replace("--", ""));
        } else if (tokens[1] == "=") {
            dest.push("  lda " + isConst(tokens[2]) + (tokens[3] ? "," + tokens[3].substring(1, 2) : ""));
            dest.push("  sta " + tokens[0]);
        } else if (tokens[1] == "+=") {
            dest.push("  lda " + isConst(tokens[2]));
            dest.push("  clc");
            dest.push("  adc " + tokens[0]);
            dest.push("  sta " + tokens[0]);
        } else { // misc or error
            dest.push(line);
        }
    }

    $("textarea").val(dest.join("\n"));
    $(".assembleButton").click();
    $(".runButton").click();
})();
