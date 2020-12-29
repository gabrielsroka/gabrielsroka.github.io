10 rem list basic
20 poke 53280, 13
30 poke 53281, 1
40 print "{black}"


200 rem load tokens from basic rom
210 e = 0
220 t = 0
230 ts = 75
240 dim a, c, t$, t$(ts)
250 for a = 41118 to 41372
260 c = peek(a)
270 if c > 127 then c = c - 128 : e = 1
280 t$ = t$ + chr$(c)
290 if e = 0 goto 320
300 print"{clear}loading token" t "of" ts; t$
310 e=0 : t$(t)=t$ : t$="" : t=t+1
320 next


400 rem load lines
410 a = 2049 : ls = 0
420 dim l, h, n, q, l$, l$(80)
430 print "{clear}";

440 rem address of next line
460 l = peek(a):a=a+1
470 h = peek(a):a=a+1
480 if l = 0 and h = 0 goto 700
490 rem basic line number
500 l = peek(a):a=a+1
510 h = peek(a):a=a+1
515 n = l + h * 256
520 l$ = mid$(str$(n), 2) + " "
525 q = 0

530 rem main line loop. line ends w/ 0
540 c = peek(a):a=a+1
550 if c = 0 goto 660
600 ifc>=128 and c<255 and not qgoto640
610 if c = 34 then q = not q
620 l$ = l$ + chr$(c)
630 goto 530

640 l$ = l$ + t$(c - 128)
650 goto 530

660 l$(ls) = l$
670 print "{home}line" n
680 ls = ls + 1
690 goto 440


700 rem print and kbd
710 pg = 23 : dim j, y, bo, k$

720 print "{clear}";
730 if j > ls - pg then j = ls - pg
740 if j < 0 then j = 0
750 for y = 0 to pg - 1
760 if y + j < ls then print l$(y + j)
770 next
780 bo = j + pg
785 if bo > ls then bo = ls
790 print j+1 "-" bo "of" ls "(h)elp";

800 get k$
810 if k$ = "" goto 800
820 if k$="{up}" then j = j-1:goto 720
830 if k$="{down}" then j = j+1:goto 720
840 if k$="{left}" then j = j-pg:goto 720
850 if k$="{right}" then j = j+pg:goto 720
860 if k$="{f1}" then j = 0 : goto 720
870 if k$="{f7}" then j = ls : goto 720
880 if k$ <> "h" goto 950
890 print
900 print "up dn - scroll 1 line"
910 print "lt rt - scroll 1 page"
920 print "f1 f7 - scroll to top/end"
930 print "x q - exit";
940 goto 800

950 if k$ <>"x" and k$ <>"q" goto 800
960 print "{left*15}";
970 print "                {up}";
