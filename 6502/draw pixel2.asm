; draw pixel at xPos,yPos
; xPos + yPos * 32 + 512
; xPos + yPos * #$20 + #$200

define xPos $00
define yPos $01
define screenLo $02
define screenHi $03

define maxPos $20
define color $01 ; white

  lda #$00
  sta yPos

yPosLoop:
  lda #$00
  sta xPos
xPosLoop:
  jsr drawPixel
  inc xPos
  lda xPos
  cmp #maxPos
  bne xPosLoop

  inc yPos
  lda yPos
  cmp #maxPos
  bne yPosLoop
  brk

drawPixel:
  lda #$00
  sta screenHi

  lda yPos
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
  ldy xPos
  sta (screenLo),y
  rts



; draw pixel at xPos,yPos

define xPos $00
define yPos $01
define screenLo $02
define screenHi $03

define maxPos $20
define color $01 ; white

; xPos + yPos * 32 + 512
; xPos + yPos * #$20 + #$200

  lda #$00
  sta yPos

yPosLoop:
  lda #$00
  sta xPos
xPosLoop:
  jsr drawPixel
  inc xPos
  lda xPos
  cmp #maxPos
  bne xPosLoop

  inc yPos
  lda yPos
  cmp #maxPos
  bne yPosLoop
  brk

drawPixel:
  lda #$00
  sta screenHi

  lda yPos
  asl ; ypos * 32
  asl
  asl
  sta screenLo

  asl screenLo
  rol screenHi
  asl screenLo
  rol screenHi

  lda #$02 ; start of screen
  clc
  adc screenHi
  sta screenHi

  lda #color
  ldy xPos
  sta (screenLo),y
  rts


; draw pixel at xPos,yPos

define xPos $00
define yPos $01
define screenLo $02
define screenHi $03

; xPos + yPos * 32 + 512
; xPos + yPos * #$20 + #$200

  lda #$00
  sta yPos

yPosLoop:
  lda #$00
  sta xPos
xPosLoop:
  jsr drawPixel
  inc xPos
  lda xPos
  cmp #$20 ; max xPos
  bne xPosLoop

  inc yPos
  lda yPos
  cmp #$20 ; max yPos
  bne yPosLoop
  brk

drawPixel:
  lda #$00
  sta screenHi

  lda yPos
  asl ; ypos * 32
  asl
  asl
  sta screenLo

  asl screenLo
  rol screenHi
  asl screenLo
  rol screenHi

  lda screenLo
  clc
  adc xPos
  sta screenLo

  lda #$02 ; start of screen
  clc
  adc screenHi
  sta screenHi

  lda #$01
  ldy #$00
  sta (screenLo),y
  rts
