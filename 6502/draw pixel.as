


; draw pixel at y,x (registers)
; xPos + yPos * 32 + 512
; xPos + yPos * #$20 + #$200

define screenLo $00
define screenHi $01

define maxPos $20
define color $01 ; white

  ldx #$00 ; yPos in x reg
yPosLoop:
  ldy #$00 ; xPos in y reg
xPosLoop:
  jsr drawPixel
  iny
  cpy #maxPos
  bne xPosLoop

  inx
  cpx #maxPos
  bne yPosLoop
  brk

drawPixel:
  lda #$00
  sta screenHi

  txa
  asl ; yPos * 32
  asl
  asl
  sta screenLo

  asl screenLo
  rol screenHi
  asl screenLo
  rol screenHi

  inc screenHi ; #$02 == start of screen
  inc screenHi

  lda #color
  sta (screenLo),y
  rts
  
  
  

; draw pixel at y,x (registers)
; xPos + yPos * 32 + 512
; xPos + yPos * #$20 + #$200

define screenLo $00
define screenHi $01

define maxPos $20
define color $01 ; white

  ldx #$00 ; yPos in x reg
yPosLoop:
  ldy #$00 ; xPos in y reg
xPosLoop:
  jsr drawPixel
  iny
  cpy #maxPos
  bne xPosLoop

  inx
  cpx #maxPos
  bne yPosLoop
  brk

drawPixel:
  lda #$00
  sta screenHi

  txa
  asl ; yPos * 32
  asl
  asl
  sta screenLo

  asl screenLo
  rol screenHi
  asl screenLo
  rol screenHi

  inc screenHi ; #$02 == start of screen
  inc screenHi

  lda #color
  sta (screenLo),y
  rts