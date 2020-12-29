10 rem list basic
40 poke 53280, 13
50 poke 53281, 1
60 print "{black}"

200 rem load tokens from basic rom
210 e = 0
220 t = 0
230 ct = 75
240 dim a, c, t$(ct)
250 for a = 41118 to 41372
260 c = peek(a)
270 if c > 127 then c = c - 128 : e = 1
280 t$ = t$ + chr$(c)
290 if e=0 goto 300
294 print"{clear}loading token" t "of" ct; t$
295 e=0 : t$(t)=t$ : t$="" : t=t+1
300 next

400 rem load lines
410 b = 2049 : x = 0
415 dim l$(80)
420 print "{clear}";
430 rem address of next line
435 q = 0
440 la = peek(b):b=b+1
450 ha = peek(b):b=b+1
470 if la = 0 and ha = 0 goto 1000
480 rem basic line number
490 ln = peek(b):b=b+1
500 hn = peek(b):b=b+1
520 l$=mid$(str$(ln+hn*256), 2) + " "
530 rem main line loop. line ends w/ 0
540 v = peek(b):b=b+1
560 if v > 0 goto 610
570 l$(x) = l$
585 print "{home}line" x
590 x = x + 1
600 goto 430
610 ifv>=128 and v<255 and not qgoto640
615 if v = 34 then q = not q
620 l$ = l$ + chr$(v)
630 goto 530
640 l$ = l$ + t$(v - 128)
650 goto 530

1000 rem print and kbd
1010 pg = 23
1100 print "{clear}";
1110 if j > x - pg then j = x - pg
1120 if j < 0 then j = 0
1130 for y = 0 to pg - 1
1140 if y + j < x then print l$(y + j)
1150 next
1160 bo = j + pg
1170 if bo > x then bo = x
1180 print j+1 "-" bo"of" x"(h)elp";

1200 get k$
1210 if k$ = "" goto 1200
1250 if k$="{up}" then j = j-1:goto 1100
1260 if k$="{down}" then j = j+1:goto 1100
1270 if k$="{left}" then j = j-pg:goto 1100
1280 if k$="{right}" then j = j+pg:goto 1100
1290 if k$="{f1}" then j = 0 : goto 1100
1300 if k$="{f7}" then j = x : goto 1100
1315 if k$ <> "h" goto 1500
1320 print
1330 print "up dn - scroll 1 line"
1340 print "lt rt - scroll 1 page"
1350 print "f1 f7 - scroll to top/end"
1360 print "x q - exit";
1400 goto 1200

1500 if k$ <>"x" and k$ <>"q" goto 1200
1510 print "{left*15}";
1520 print "                {up}";
