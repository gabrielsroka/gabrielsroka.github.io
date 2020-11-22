; clear screen

define screenStartHi $02
define pages $04
define bgColor $01 // white

define screen $0
define page $1

  lda #screenStartHi
  sta page
  lda #bgColor
  ldx #pages
xLoopClearScreen:
  ldy #$00
yLoopClearScreen:
  sta (screen),y
  iny
  bne yLoopClearScreen
  inc page
  dex
  bne xLoopClearScreen
