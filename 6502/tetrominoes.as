; tetrominoes
; keys:   W
;       A S D

define startPage $03 ; screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define lastPage $06
define startTopOfPage $08
define start $88 ; height of 20
define nextrow $20
define bgColor $00 ; black
define fgColor $01 ; white
define blockLength $04
define keyCode $ff
define keyA $61
define keyD $64

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #start
  sta screen
  lda #startPage
  sta page
  lda #startTopOfPage
  sta erase
  lda #startPage
  sta ePage
  lda #startTopOfPage
  sta topOfPage
loopRow:
  ldy #blockLength
yLoopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  dey
  bne yLoopBlock

  lda screen ; save old location
  sta erase
  lda page
  sta ePage

  jsr sleep
  jsr checkKeys

  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow

  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

sleep:
  ldy #$10
sleepMore:
  ldx #0
sleepLoop:
  nop
  nop
  dex
  bne sleepLoop
  dey
  bne sleepMore
  rts

checkKeys:
  lda keyCode
  cmp #keyD
  beq onKeyD
  cmp #keyA
  bne skip
onKeyA:
  dec screen
  dec topOfPage
  jmp clearKey
onKeyD:
  inc screen
  inc topOfPage
clearKey:
  lda #$00
  sta keyCode
skip:
  rts




; tetrominoes
; keys:   W
;       A S D

define startPage $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define lastPage $06
define startTopOfPage $08
define start $88 ; height of 20
define nextrow $20
define bgColor $00 // black
define fgColor $01 // white
define blockLength $04
define keyCode $ff
define keyA $61
define keyD $64

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #start
  sta screen
  lda #startPage
  sta page
  lda #startTopOfPage
  sta erase
  lda #startPage
  sta ePage
  lda #startTopOfPage
  sta topOfPage
loopRow:
  ldy #blockLength
yLoopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  dey
  bne yLoopBlock

  lda screen ; save old location
  sta erase
  lda page
  sta ePage

  jsr sleep
  jsr checkKeys

  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow

  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

sleep:
  ldy #$10
sleepMore:
  ldx #0
sleepLoop:
  nop
  nop
  dex
  bne sleepLoop
  dey
  bne sleepMore
  rts

checkKeys:
  lda keyCode
  cmp #keyD
  beq onKeyD
  cmp #keyA
  bne skip
onKeyA:
  dec screen
  dec topOfPage
  jmp clearKey
onKeyD:
  inc screen
  inc topOfPage
clearKey:
  lda #$00
  sta keyCode
skip:
  rts




; tetrominoes
; keys:   W
;       A S D

define startPage $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define lastPage $06
define startTopOfPage $08
define start $88 ; height of 20
define nextrow $20
define bgColor $00 // black
define fgColor $01 // white
define blockLength $04
define keyCode $ff
define keyA $61
define keyD $64

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #startTopOfPage
  sta topOfPage
  lda #start
  sta screen
  lda #startPage
  sta page
  lda #startTopOfPage
  sta erase
  lda #startPage
  sta ePage
loopRow:
  ldy #blockLength
yLoopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  dey
  bne yLoopBlock

  lda screen ; save old location
  sta erase
  lda page
  sta ePage

  jsr sleep
  jsr checkKeys

  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow

  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

sleep:
  ldy #$10
sleepMore:
  ldx #0
sleepLoop:
  nop
  nop
  dex
  bne sleepLoop
  dey
  bne sleepMore
  rts

checkKeys:
  lda keyCode
  cmp #keyD
  beq onKeyD
  cmp #keyA
  bne skip
onKeyA:
  dec screen
  dec topOfPage
  jmp clearKey
onKeyD:
  inc screen
  inc topOfPage
clearKey:
  lda #$00
  sta keyCode
skip:
  rts




; tetrominoes
; keys:   W
;       A S D

define nextrow $20
define screenStartHi $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define bgColor $00 // black
define fgColor $01 // white
define lastPage $06
define startTopOfPage $08
define start $88 ; height of 20
define length $04
define keyCode $ff
define keyA $61
define keyD $64

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #startTopOfPage
  sta topOfPage
  lda #start
  sta screen
  lda #screenStartHi
  sta page
  lda #startTopOfPage
  sta erase
  lda #screenStartHi
  sta ePage
loopRow:
  ldy #$00
loopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  iny
  cpy #length
  bne loopBlock

  lda screen ; save old location
  sta erase
  lda page
  sta ePage

  jsr sleep
  jsr checkKeys

  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow

  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

sleep:
  ldy #$10
sleepMore:
  ldx #0
sleepLoop:
  nop
  nop
  dex
  bne sleepLoop
  dey
  bne sleepMore
  rts

checkKeys:
  lda keyCode
  cmp #keyD
  beq onKeyD
  cmp #keyA
  bne skip
onKeyA:
  dec screen
  dec topOfPage
  jmp clearKey
onKeyD:
  inc screen
  inc topOfPage
clearKey:
  lda #$00
  sta keyCode
skip:
  rts




; tetrominoes
; keys: W A S D

define nextrow $20
define screenStartHi $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define bgColor $00 // black
define fgColor $01 // white
define lastPage $06
define startTopOfPage $08
define start $88 ; height of 20
define length $04
define keyCode $ff
define keyA $61
define keyD $64

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #startTopOfPage
  sta topOfPage
  lda #start
  sta screen
  lda #screenStartHi
  sta page
  lda #startTopOfPage
  sta erase
  lda #screenStartHi
  sta ePage
loopRow:
  ldy #$00
loopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  iny
  cpy #length
  bne loopBlock
  jsr spinWheels
  jsr keys
  lda screen
  sta erase
  lda page
  sta ePage
  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow
  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

spinWheels:
  ldy #$10
more:
  ldx #0
spinloop:
  nop
  nop
  dex
  bne spinloop
  dey
  bne more
  rts

keys:
  lda keyCode
  cmp #keyD
  beq d
  cmp #keyA
  bne skip
a:
  dec screen
  dec erase
  dec topOfPage
  jmp clear
d:
  inc screen
  inc erase
  inc topOfPage
clear:
  lda #$00
  sta keyCode
skip:
  rts




; tetrominoes
; keys: W A S D

define nextrow $20
define screenStartHi $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define bgColor $00 // black
define fgColor $01 // white
define lastPage $06
define topOfPage $08
define start $88 ; height of 20
define length $04

define screen $0
define page $1
define erase $2
define ePage $3
define topOfPage $4

  lda #$08
  sta topOfPage
  lda #start
  sta screen
  lda #screenStartHi
  sta page
  lda #topOfPage
  sta erase
  lda #screenStartHi
  sta ePage
loopRow:
  ldy #$00
loopBlock:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  iny
  cpy #length
  bne loopBlock
  jsr spinWheels
  jsr keys
  lda screen
  sta erase
  lda page
  sta ePage
  lda #nextrow
  clc
  adc screen
  sta screen
  cmp topOfPage
  bne loopRow
  inc page
  lda page 
  cmp #lastPage
  bne loopRow
  brk

spinWheels:
  ldy #$10
more:
  ldx #0
spinloop:
  nop
  nop
  dex
  bne spinloop
  dey
  bne more
  rts

keys:
  lda $ff
  cmp #$61
  beq a
  cmp #$64
  beq d
  jmp skip
a:
  dec screen
  dec erase
  dec topOfPage
  jmp skip
d:
  inc screen
  inc erase
  inc topOfPage
skip:
  rts
  
  
  

define nextrow $20
define screenStartHi $03 // screen: $0200 to $05ff, 32 px * 32 px, 4 pages each 8 px tall
define bgColor $00 // black
define fgColor $01 // white
define lastPage $06
define topOfPage $10
define start $90 ; height of 20
define length $04

define screen $0
define page $1
define erase $2
define ePage $3

  lda #start
  sta screen
  lda #screenStartHi
  sta page
  lda #topOfPage
  sta erase
  lda #screenStartHi
  sta ePage
loop:
  ldy #$00
next:
  lda #fgColor
  sta (screen),y
  lda #bgColor
  sta (erase),y
  iny
  cpy #length
  bne next

  jsr spinWheels
  lda screen
  sta erase
  lda page
  sta ePage
  lda #nextrow
  clc
  adc screen
  sta screen
brk
  cmp #topOfPage
  bne loop
  inc page
  lda page 
  cmp #lastPage
  bne loop
  brk

spinWheels:
  ldx #0
spinloop:
  nop
  nop
  dex
  bne spinloop
  rts
