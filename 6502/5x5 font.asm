; 5x5 font.AWI
const width = $05
const height = $05
const charspacing = $66 ; $20 * $03 + $06
const nextrow = $20
const color = $0a

var screen
var page = #$02
var offset = #height
var lines
var chars
var bits

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
        bits = charData + x
        a = #color
        for y = #$00 to #width {
            rotateleft bits
            if c != 0 {
                (screen) + y = a
            }
        }
        screen += #nextrow
    } 
    offset += #height
    screen += #charspacing
}




; auto-converted
; 5x5 font
define width $05
define height $05
define charspacing $66
define nextrow $20
define color $0a

define screen $0
define page $1
  lda #$02
  sta page
define offset $2
  lda #height
  sta offset
define lines $3
define chars $4
define bits $5

  ldx #$00
  lda #$04
  sta lines
nextlines:
  jsr printLine
  dec lines
  bne nextlines
  brk

printLine:
  lda #$21
  sta screen
  lda #$05
  sta chars
nextchars:
  jsr printChar
  dec chars
  bne nextchars
  inc page
  rts

printChar:
nextx:
  lda charData,x
  sta bits
  lda #color
  ldy #$00
nexty:
  rol bits
  bcc onCC
  sta (screen),y
onCC:
  iny
  cpy #width
  bne nexty
  lda #nextrow
  clc
  adc screen
  sta screen
  inx
  cpx offset
  bne nextx
  lda #height
  clc
  adc offset
  sta offset
  lda #charspacing
  clc
  adc screen
  sta screen
  rts

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

  



; 5x5 font
define width $05
define height $05
define charSpacing $66 ; HACK! it overflows
;define charSpacing $06 ; width + 1
define nextRow $20 ; next row of pixels
define color $0a ; red

define screen $00 ; LO
define page $01   ; HI
define offset $02
define lines $03
define chars $04

  ldx #$00
  lda #$02 ; screen is at $200
  sta page ; screen hi
  lda #height
  sta offset
  lda #$04
  sta lines

nextLine:
  jsr line
  dec lines
  bne nextLine
  brk

line:
  lda #$21 ; 1 pixel to the right and 1 px down
  sta screen
  lda #$05
  sta chars
nextChar:
  jsr char
  dec chars
  bne nextChar
  inc page
  rts

char:
  lda #color
  ldy #$00
pixel:
  rol charData,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #width
  bne pixel
  lda #nextRow
  clc
  adc screen
  sta screen
  inx
  cpx offset
  bne char
  lda #height
  clc
  adc offset
  sta offset
  lda #charSpacing
  clc
  adc screen
  sta screen
  rts

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
