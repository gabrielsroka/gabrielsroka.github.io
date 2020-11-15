sm custom font 267 bytes
lg custom font 410

8x8 - 149
5x8 - 149
5x7 - 141
5x5 - 125



; 5x5 font
define screen $00
define page $01
define offset $02

define width $05
define height $05
define charSpacing $66 ; HACK! it overflows
;define charSpacing $06 ; width + 1
define nextRow $20 ; next row of pixels
define color $0a ; red

  ldx #$00
  lda #height
  sta offset
  LDA #$02 ; screen is at $200
  STA page ; screen hi

  jsr line
  jsr line
  jsr line
  jsr line
  brk

line:
  lda #$21 ; 1 pixel to the right and 1 px down
  sta screen
  jsr char
  jsr char
  jsr char
  jsr char
  jsr char
  inc page
  rts

char:
  lda #color
  ldy #$00
pixel:
  rol chars,x
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

chars:
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




; 5x7 font
define screen $00
define page $01
define offset $02

define width $05
define height $07
define charSpacing $26 ; HACK! it overflows
;define charSpacing $06 ; one more than width
define nextRow $20 ; next row of pixels
define color $0a ; red

  ldx #$00
  lda #height
  sta offset
  LDA #$02 ; screen is at $200
  STA page ; screen hi

  jsr line
  jsr line
  jsr line
  jsr line
  brk

line:
  lda #$01 ; 1 pixel to the right
  sta screen
  jsr char
  jsr char
  jsr char
  jsr char
  jsr char
  inc page
  rts

char:
  lda #color
  ldy #$00
pixel:
  rol chars,x
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

chars:
dcb $00,$70,$88,$80,$98,$88,$70 ; G
dcb $00,$70,$88,$88,$f8,$88,$88 ; A
dcb $00,$88,$d8,$a8,$88,$88,$88 ; M
dcb $00,$f8,$80,$f0,$80,$80,$f8 ; E
dcb $00,$00,$00,$00,$00,$00,$00 ; space

dcb $00,$70,$88,$88,$88,$88,$70 ; O
dcb $00,$88,$88,$50,$50,$20,$20 ; V
dcb $00,$f8,$80,$f0,$80,$80,$f8 ; E
dcb $00,$f0,$88,$f0,$a0,$90,$88 ; R
dcb $00,$20,$20,$20,$20,$00,$20 ; !

dcb $00,$f0,$88,$f0,$88,$88,$f0 ; B
dcb $00,$70,$88,$80,$80,$88,$70 ; C
dcb $00,$f0,$88,$88,$88,$88,$f0 ; D
dcb $00,$f8,$80,$f0,$80,$80,$80 ; F
dcb $00,$88,$88,$f8,$88,$88,$88 ; H

dcb $00,$f8,$20,$20,$20,$20,$f8 ; I
dcb $00,$7e,$08,$08,$08,$48,$30 ; J
dcb $00,$48,$50,$60,$60,$50,$48 ; K
dcb $00,$80,$80,$80,$80,$80,$f8 ; L
dcb $00,$88,$c8,$a8,$98,$88,$88 ; N




; 5x8 font
define screen $00
define page $01
define offset $02

  ldx #$00
  lda #$08
  sta offset
  LDA #$02
  STA page ; screen hi

  jsr oneLine
  jsr oneLine
  jsr oneLine
  jsr oneLine
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$05
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$06
  clc
  adc screen
  sta screen
  rts

oneLine:
  lda #$01
  sta screen
  jsr row
  jsr row
  jsr row
  jsr row
  jsr row
  inc page
  rts

chars:
dcb $00,$70,$88,$80,$98,$88,$70,$00 ; G
dcb $00,$70,$88,$88,$f8,$88,$88,$00 ; A
dcb $00,$88,$d8,$a8,$88,$88,$88,$00 ; M
dcb $00,$f8,$80,$f0,$80,$80,$f8,$00 ; E
dcb $00,$00,$00,$00,$00,$00,$00,$00 ; space

dcb $00,$70,$88,$88,$88,$88,$70,$00 ; O
dcb $00,$88,$88,$50,$50,$20,$20,$00 ; V
dcb $00,$f8,$80,$f0,$80,$80,$f8,$00 ; E
dcb $00,$f0,$88,$f0,$a0,$90,$88,$00 ; R
dcb $00,$20,$20,$20,$20,$00,$20,$00 ; !

dcb $00,$f0,$88,$f0,$88,$88,$f0,$00 ; B
dcb $00,$70,$88,$80,$80,$88,$70,$00 ; C
dcb $00,$f0,$88,$88,$88,$88,$f0,$00 ; D
dcb $00,$f8,$80,$f0,$80,$80,$80,$00 ; F
dcb $00,$88,$88,$f8,$88,$88,$88,$00 ; H

dcb $00,$f8,$20,$20,$20,$20,$f8,$00 ; I
dcb $00,$7e,$08,$08,$08,$48,$30,$00 ; J
dcb $00,$48,$50,$60,$60,$50,$48,$00 ; K
dcb $00,$80,$80,$80,$80,$80,$f8,$00 ; L
dcb $00,$88,$c8,$a8,$98,$88,$88,$00 ; N




; 5x8 font
define screen $00
define page $01
define offset $02

  ldx #$00
  lda #$08
  sta offset
  LDA #$01
  STA page ; screen hi

  jsr oneLine
  jsr oneLine
  jsr oneLine
  jsr oneLine
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$05
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$06
  clc
  adc screen
  sta screen
  rts

oneLine:
  lda #$01
  sta screen
  inc page
  jsr row
  jsr row
  jsr row
  jsr row
  jsr row
  rts

chars:
dcb $00,$70,$88,$80,$98,$88,$70,$00 ; G
dcb $00,$70,$88,$88,$f8,$88,$88,$00 ; A
dcb $00,$88,$d8,$a8,$88,$88,$88,$00 ; M
dcb $00,$f8,$80,$f0,$80,$80,$f8,$00 ; E
dcb 0,0,0,0,0,0,0,0 ; space

dcb $00,$70,$88,$88,$88,$88,$70,$00 ; O
dcb $00,$88,$88,$50,$50,$20,$20,$00 ; V
dcb $00,$f8,$80,$f0,$80,$80,$f8,$00 ; E
dcb $00,$f0,$88,$f0,$a0,$90,$88,$00 ; R
dcb 0,$20,$20,$20,$20,0,$20,0 ; !

dcb $00,$f0,$88,$f0,$88,$88,$f0,$00 ; B
dcb $00,$70,$88,$80,$80,$88,$70,$00 ; C
dcb $00,$f0,$88,$88,$88,$88,$f0,$00 ; D
dcb $00,$f8,$80,$f0,$80,$80,$80,$00 ; F
dcb $00,$88,$88,$f8,$88,$88,$88,$00 ; H

dcb $00,$f8,$20,$20,$20,$20,$f8,$00 ; I
dcb $00,$7e,$08,$08,$08,$48,$30,$00 ; J
dcb $00,$48,$50,$60,$60,$50,$48,$00 ; K
dcb $00,$80,$80,$80,$80,$80,$f8,$00 ; L
dcb $00,$88,$c8,$a8,$98,$88,$88,$00 ; N






; 8x8 font
define screen $00
define page $01
define offset $02

  ldx #$00
  lda #$08
  sta offset
  LDA #$01
  STA page ; screen hi

  jsr oneLine
  jsr oneLine
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$08
  clc
  adc screen
  sta screen
  rts

oneLine:
  lda #$00
  sta screen
  inc page
  jsr row
  jsr row
  jsr row
  jsr row
  rts

chars:
dcb $00,$3c,$42,$40,$46,$42,$3c,$00 ; G
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$42,$66,$5a,$42,$42,$42,$00 ; M
dcb $00,$7e,$40,$7c,$40,$40,$7e,$00 ; E

dcb $00,$3c,$42,$42,$42,$42,$3c,$00 ; O
dcb $00,$42,$42,$24,$24,$18,$18,$00 ; V
dcb $00,$7e,$40,$7c,$40,$40,$7e,$00 ; E
dcb $00,$7c,$42,$7c,$50,$48,$44,$00 ; R

;dcb $00,$7c,$42,$7c,$42,$42,$7c,$00 ; B
;dcb $00,$3c,$42,$40,$40,$42,$3c,$00 ; C
;dcb $00,$7c,$42,$42,$42,$42,$7c,$00 ; D
;dcb $00,$7e,$40,$7c,$40,$40,$40,$00 ; F

;dcb $00,$42,$42,$7e,$42,$42,$42,$00 ; H
;dcb $00,$7e,$08,$08,$08,$08,$7e,$00 ; I
;dcb $00,$7e,$08,$08,$08,$48,$30,$00 ; J
;dcb $00,$48,$50,$60,$60,$50,$48,$00 ; K







define screen $00
define page $01
define offset $02

  ldx #$00
  lda #$08
  sta offset
  LDA #$01
  STA page ; screen hi

  jsr oneLine
  jsr oneLine
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$08
  clc
  adc screen
  sta screen
  rts

oneLine:
  lda #$00
  sta screen
  inc page
  jsr row
  jsr row
  jsr row
  jsr row
  rts

chars:
dcb $00,$3c,$42,$40,$46,$42,$3c,$00 ; G
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$42,$66,$5a,$42,$42,$42,$00 ; M
dcb $00,$7e,$40,$7c,$40,$40,$7e,$00 ; E

dcb $00,$3c,$42,$42,$42,$42,$3c,$00 ; O
dcb $00,$42,$42,$24,$24,$18,$18,$00 ; V
dcb $00,$7e,$40,$7c,$40,$40,$7e,$00 ; E
dcb $00,$7c,$42,$7c,$50,$48,$44,$00 ; R

;dcb $00,$7c,$42,$7c,$42,$42,$7c,$00 ; B
;dcb $00,$3c,$42,$40,$40,$42,$3c,$00 ; C
;dcb $00,$7c,$42,$42,$42,$42,$7c,$00 ; D
;dcb $00,$7e,$40,$7c,$40,$40,$40,$00 ; F

;dcb $00,$42,$42,$7e,$42,$42,$42,$00 ; H
;dcb $00,$7e,$08,$08,$08,$08,$7e,$00 ; I
;dcb $00,$7e,$08,$08,$08,$48,$30,$00 ; J
;dcb $00,$48,$50,$60,$60,$50,$48,$00 ; K





define screen $00
define page $01
define offset $02

  ldx #$00
  lda #$08
  sta offset
  LDA #$01
  STA page ; screen H

jsr nextLine
  jsr row
  jsr row
  jsr row
  jsr row

jsr nextLine
  jsr row
  jsr row
  jsr row
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$08
  clc
  adc screen
  sta screen
  rts

nextLine:
  lda #$00
  sta screen
  inc page
  rts

chars:
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$7c,$42,$7c,$42,$42,$7c,$00 ; B
dcb $00,$3c,$42,$40,$40,$40,$3c,$00 ; C
dcb $00,$7c,$42,$42,$42,$42,$7c,$00 ; D
dcb $00,$7e,$40,$7c,$40,$40,$7e,$00 ; E
dcb $00,$7e,$40,$7c,$40,$40,$40,$00 ; F
dcb $00,$3c,$42,$40,$46,$42,$3c,$00 ; G







define screen $00
define page $01
define offset $02

  LDA #$00
  STA screen ; screen L
  LDA #$02
  STA page ; screen H
  ldx #$00
  lda #$08
  sta offset

  jsr row
  jsr row
  jsr row
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  lda #$08
  clc
  adc offset
  sta offset
  lda #$08
  clc
  adc screen
  sta screen
  rts

chars:
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$7c,$42,$7c,$42,$42,$7c,$00 ; B
dcb $00,$3c,$40,$40,$40,$40,$3c,$00 ; C







define screen $00
define page $01
define offset $02

  LDA #$00
  STA screen ; screen L
  LDA #$02
  STA page ; screen H
  ldx #$00

  lda #$08
  sta offset
  jsr row

  lda #$08
  sta screen
  lda #$10
  sta offset
  jsr row
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx offset
  bne row
  rts

chars:
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$7c,$42,$7c,$42,$42,$7c,$00 ; B





define screen $00
define page $01

  LDA #$00
  STA screen ; screen L
  LDA #$02
  STA page ; screen H
  lda #$08
  sta $02

  ldx #$00
  jsr row
  lda #$08
  sta screen
  lda #$10
  sta $02
  jsr row
  brk

row:
  lda #$0a ; red
  ldy #$00
pixel:
  rol chars,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne pixel
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx $02
  bne row
  rts

chars:
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A





define screen $00
define page $01

jmp start

char:
dcb $00,$3c,$42,$7e,$42,$42,$42,$00 ; A

start:
  LDA #$00
  STA screen ; screen L
  LDA #$02
  STA page ; screen H
  ldx #$00
loop2:
  lda #$0a ; red
  ldy #$00
loop:
  rol char,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne loop
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx #$08
  bne loop2

  
---




define screen $00
define page $01
define byte $02

  LDA #$00
  STA screen ; screen L
  LDA #$02
  STA page ; screen H
  lda #$aa
  sta byte
  lda #$55
  sta $03
	
  ldx #$00
loop2:
  lda #$0a ; red
  ldy #$00
loop:
  rol byte,x
  bcc noPixel
  sta (screen),y
noPixel:
  iny
  cpy #$08
  bne loop
  clc
  lda #$20
  adc screen
  sta screen
  inx
  cpx #$02
  bne loop2

  