!-  mine: c000=a9 41 20 d2 ff 60 r
!- woz's: c000=a9 20 aa 20 d2 ff e8 8a c9 5b d0 f6 60 r
!-    or: c000=a9 20 aa 20 d2 ff e8 8a c9 5b d0 f6 4c 00 c0 r

1 poke 19,1:rem turn off "?" during input

2 print "/";:rem escape

3 print:input i$:print:m=0:y=0:rem getline/nextchar/setmode

4 y=y+1:rem blskip
5 if y>len(i$) goto 3:rem nextitem
6 c$=mid$(i$,y,1):if c$<"-" goto 4
7 if c$="-" then m=1:goto 4
8 if c$="=" then m=2:goto 4
9 if c$="r" then sys x:goto 4:rem run
10 h=0:v=y

11 c$=mid$(i$,y,1):if (c$<"0" or c$>"9") and (c$<"a" or c$>"f") goto 14:rem nexthex
12 c=asc(c$)-48:if c>9 then c=c-7:rem dig
13 h=h*16+c:y=y+1:goto 11

14 if y=v goto 2:rem nothex
15 if m=2 then poke s,h:s=s+1:goto 5
16 if m=0 then s=h:x=h:rem notstor/setadr
17 a=0:if m goto 20

18 if a=0 then print:z=x/256 and 255:gosub 22:z=x-z*256:gosub 22:print ":";:rem nxtprnt
19 print " ";:z=peek(x):gosub 22:rem prdata
20 m=0:if x<h then x=x+1:a=x-32768 and 7:goto 18:rem xamnext/mod8chk

21 goto 5

22 c=z/16:gosub 24:rem prbyte
23 c=z:rem fall thru to next gosub

24 c=c and 15:if c>9 then c=c+7:rem prhex
25 print chr$(48+c);:return:rem echo
