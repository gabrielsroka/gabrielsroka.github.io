1 rem list basic
2 poke 53280, 13
3 poke 53281, 1
4 print "{black}"


10 rem globals
20 dim ls
30 tl = 128 : th = 255
40 rem locals
50 dim a, c, e, t, t$
60 dim l, h, n, q, l$
70 pg = 23 : dim j, i, bo, k$
80 rem arrays
90 ts = 75 : dim t$(ts), l$(80)


100 rem copy basic rom tokens to t$()
120 for a = 41118 to 41372
130 c = peek(a)
140 if c >= tl then c = c - tl : e = 1
150 t$ = t$ + chr$(c)
160 if e = 0 goto 190
170 print"{clear}loading token" t "of" ts; t$
180 e=0 : t$(t)=t$ : t$="" : t=t+1
190 next


300 rem copy basic lines to l$()
310 a = 2049
330 print "{clear}";

400 rem address of next line
410 l = peek(a):a=a+1
420 h = peek(a):a=a+1
430 if l = 0 and h = 0 goto 700
440 rem basic line number
450 l = peek(a):a=a+1
460 h = peek(a):a=a+1
470 n = l + h * 256
480 l$ = mid$(str$(n), 2) + " "
490 q = 0

500 rem main line loop. line ends w/ 0
510 c = peek(a):a=a+1
520 if c = 0 goto 590
530 ifc>=tl and c<th and not q goto 570
540 if c = 34 then q = not q
550 l$ = l$ + chr$(c)
560 goto 500

570 l$ = l$ + t$(c - tl)
580 goto 500

590 l$(ls) = l$
600 print "{home}line" n
610 ls = ls + 1
620 goto 400


700 rem print and kbd

710 print "{clear}";
720 if j > ls - pg then j = ls - pg
730 if j < 0 then j = 0
740 for i = 0 to pg - 1
750 if i + j < ls then print l$(i + j)
760 next
770 bo = j + pg
780 if bo > ls then bo = ls
790 print j+1 "-" bo "of" ls "(h)elp";

800 get k$
810 if k$ = "" goto 800
820 if k$="{up}" then j = j-1  : goto 710
830 if k$="{down}" then j = j+1  : goto 710
840 if k$="{left}" then j = j-pg : goto 710
850 if k$="{right}" then j = j+pg : goto 710
860 if k$="{home}" then j = 0    : goto 710
870 if k$="{delete}" then j = ls   : goto 710
880 if k$ = "x" or k$ = "q" goto 970
890 if k$ = "h" goto 910
900 goto 800

910 print
920 print "up dn - scroll 1 line"
930 print "lt rt - scroll 1 page"
940 print "hm dl - scroll to top/end"
950 print "x q - exit";
960 goto 800

970 print "{left*15}";
980 print "               {up}";
