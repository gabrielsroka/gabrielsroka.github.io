(function () {
    // converts JS-like code to 6502 asm
    // for https://skilldrick.github.io/easy6502/simulator
    const source = `; print 5x5 font
const width = $05
const height = $05
const nextrow = $20
const offset = $21 ; down 1 px, right 1 px
const charspacing = $66 ; $20 * $03 + $06 == nextrow * (8 - height) + (width + 1)
const screenStartHi = $02 ; $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
const color = $0a ; red

var screen ; lo
var page = #screenStartHi ; hi
var iChars = #height
var iLine
var iChar
var pixels

main()
break

main() {
    x = #$00 ; index to chars
    for iLine = #$04 to #$00 {
        printLine()
        page++
    }
}

printLine() {
    screen = #offset
    for iChar = #$05 to #$00 {
        printChar()
        iChars += #height
        screen += #charspacing
    }
}

printChar() {
    for x = x to iChars {
        pixels = chars + x
        a = #color
        for y = #$00 to #width {
            rotateleft pixels
            if c == 1 {
                (screen) + y = a
            }
        }
        screen += #nextrow
    }
}

const chars = [
    $70,$80,$98,$88,$70 ; G
    $70,$88,$f8,$88,$88 ; A
    $88,$d8,$a8,$88,$88 ; M
    $f8,$80,$f0,$80,$f8 ; E
    $00,$00,$00,$00,$00 ; space

    $70,$88,$88,$88,$70 ; O
    $88,$88,$50,$50,$20 ; V
    $f8,$80,$f0,$80,$f8 ; E
    $f0,$88,$f0,$90,$88 ; R
    $20,$20,$20,$00,$20 ; !

    $f0,$88,$f0,$88,$f0 ; B
    $70,$88,$80,$88,$70 ; C
    $f0,$88,$88,$88,$f0 ; D
    $f8,$80,$f0,$80,$80 ; F
    $88,$88,$f8,$88,$88 ; H

    $70,$20,$20,$20,$70 ; I
    $7e,$08,$08,$48,$30 ; J
    $48,$50,$60,$50,$48 ; K
    $80,$80,$80,$80,$f0 ; L
    $88,$c8,$a8,$98,$88 ; N
]
`;

    var dest = [];
    var cmds = [];
    var vars = 0;

// add: and, jmp (endless loop), cmp, beq, bit, txa, bpl, bcs, sbc, nop, (add,x), lsr, dex, sec
    var lines = source.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var tokens = line.split(" ");
        if (tokens[0] == "var") {
            dest.push("define " + tokens[1] + " $" + vars++);
            if (tokens[2] == "=") {
                dest.push("  lda " + tokens[3]);
                dest.push("  sta " + tokens[1]);
            }
        } else if (tokens[0] == "const") {
            if (tokens[3] == "[") {
                dest.push(tokens[1] + ":");
                while (true) {
                    line = lines[++i].trim();
                    if (line == "]") break;
                    dest.push(line ? "  dcb " + line : "");
                }
            } else {
                dest.push(line.replace("const", "define").replace(" =", ""));
            }
        } else if (tokens[0] == "break") {
            dest.push("  brk");
        } else if (tokens[0].match(/^[axy]$/)) {
            dest.push("  ld" + tokens[0] + " " + tokens[2]);
        } else if (tokens[0] == "rotateleft") {
            dest.push("  rol " + tokens[1] + (tokens[3] ? "," + tokens[3] : ""));
        } else if (tokens[0].endsWith("()")) {
            if (tokens[1] == "{") {
                dest.push(tokens[0].replace("()", "") + ":");
                cmds.push("  rts");
            } else {
                dest.push("  jsr " + tokens[0].replace("()", ""));
            }
        } else if (tokens[0] == "for") {
            let label = tokens[1] + "Loop";
            if (tokens[1].match(/^[xy]$/)) {
                if (tokens[1] != tokens[3]) {
                    dest.push("  ld" + tokens[1] + " " + tokens[3]);
                }
                dest.push(label + ":");
                cmds.push("  in" + tokens[1] + "\n" +
                          "  cp" + tokens[1] + " " + tokens[5] + "\n" +
                          "  bne " + label);
            } else {
                dest.push("  lda " + tokens[3]);
                dest.push("  sta " + tokens[1]);
                dest.push(label + ":");
                cmds.push("  dec " + tokens[1] + "\n" +
                          "  bne " + label);
            }
        } else if (tokens[0] == "if") {
            if (tokens[1] == "c" && tokens[2] == "==" && tokens[3] == "1") {
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
            dest.push("  lda " + tokens[2] + (tokens[4] ? "," + tokens[4] : ""));
            dest.push("  sta " + tokens[0]);
        } else if (tokens[3] == "=") {
            dest.push("  st" + tokens[4] + " " + tokens[0] + "," + tokens[2]);
        } else if (tokens[1] == "+=") {
            dest.push("  lda " + tokens[2]);
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
