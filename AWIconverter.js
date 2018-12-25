(function () {
    // for https://skilldrick.github.io/easy6502/simulator
    var source = `; 5x5 font
        const width = $05
        const height = $05
        const charspacing = $66 ; $20 * $03 + $06, 8 - height == 3, width + 1 == 6, nextrow == #$20
        const nextrow = $20
        const color = $0a

        var screen
        var page = #$02
        var offset = #height
        var lines
        var chars
        var pixels

        x = #$00
        for lines = #$04 to #$00 {
            printLine()
        }
        break

        printLine() {
            screen = #$21
            for chars = #$05 to #$00 {
                printChar()
            }
            page++
        }

        printChar() {
            for x = x to offset {
                pixels = charData + x
                a = #color
                for y = #$00 to #width {
                    rotateleft pixels
                    if c != 0 {
                        (screen) + y = a
                    }
                }
                screen += #nextrow
            } 
            offset += #height
            screen += #charspacing
        }

charData:
  dcb $70,$80,$98,$88,$70 ; G
  dcb $70,$88,$f8,$88,$88 ; A
  dcb $88,$d8,$a8,$88,$88 ; M
  dcb $f8,$80,$f0,$80,$f8 ; E
  dcb $00,$00,$00,$00,$00 ; space

  dcb $70,$88,$88,$88,$70 ; O
  dcb $88,$88,$50,$50,$20 ; V
  dcb $f8,$80,$f0,$80,$f8 ; E
  dcb $f0,$88,$f0,$90,$88 ; R
  dcb $20,$20,$20,$00,$20 ; !

  dcb $f0,$88,$f0,$88,$f0 ; B
  dcb $70,$88,$80,$88,$70 ; C
  dcb $f0,$88,$88,$88,$f0 ; D
  dcb $f8,$80,$f0,$80,$80 ; F
  dcb $88,$88,$f8,$88,$88 ; H

  dcb $f8,$20,$20,$20,$f8 ; I
  dcb $7e,$08,$08,$48,$30 ; J
  dcb $48,$50,$60,$50,$48 ; K
  dcb $80,$80,$80,$80,$f8 ; L
  dcb $88,$c8,$a8,$98,$88 ; N
`;

    var dest = [];
    var cmds = [];
    var vars = 0;

// add: and, jmp (endless loop), cmp, beq, bit, txa, bpl, bcs, sbc, nop, (add,x), lsr, dex, sec
    var lines = source.split("\n");
    for (var line of lines) {
        var tokens = line.trim().split(" ");
        if (tokens[0] == "var") {
            dest.push("define " + tokens[1] + " $" + vars++);
            if (tokens[2] == "=") {
                dest.push("  lda " + tokens[3]);
                dest.push("  sta " + tokens[1]);
            }
        } else if (tokens[0] == "const") {
            dest.push("define " + tokens[1] + " " + tokens[3]);
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
            if (tokens[1].match(/^[xy]$/)) {
                if (tokens[1] != tokens[3]) {
                    dest.push("  ld" + tokens[1] + " " + tokens[3]);
                }
                dest.push("next" + tokens[1] + ":");
                cmds.push("  in" + tokens[1] + "\n" +
                          "  cp" + tokens[1] + " " + tokens[5] + "\n" +
                          "  bne next" + tokens[1]);
            } else {
                dest.push("  lda " + tokens[3]);
                dest.push("  sta " + tokens[1]);
                dest.push("next" + tokens[1] + ":");
                cmds.push("  dec " + tokens[1] + "\n" +
                          "  bne next" + tokens[1]);
            }
        } else if (tokens[0] == "if") {
            if (tokens[1] == "c" && tokens[2] == "!=" && tokens[3] == "0") {
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
