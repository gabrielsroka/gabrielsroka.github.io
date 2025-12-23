!-  mine: c000=a9 41 20 d2 ff 60 r
!- woz's: c000=a9 20 aa 20 d2 ff e8 8a c9 80 d0 f6 60 r
!-    or: c000=a9 20 aa 20 d2 ff e8 8a c9 5b d0 f6 4c 00 c0 r

0 poke 19,1

1 print "/";:rem escape

2 print:input i$:print:m=0:y=1:rem getline/nextchar/setmode

3 c$=mid$(i$,y,1):if c$<"-" then y=y+1:goto 18:rem nextitem/blskip
4 if c$="-" then m=1:y=y+1:goto 18
5 if c$="=" then m=2:y=y+1:goto 18
6 if c$="r" then sys x:y=y+1:goto 18:rem run
7 h=0:v=y

8 c$=mid$(i$,y,1):if not (c$>="0" and c$<="9" or c$>="a" and c$<="f") goto 11:rem nexthex
9 c=asc(c$)-48:if c>9 then c=c-7:rem dig
10 h=h*16+c:y=y+1:goto 8

11 if y=v goto 1:rem nothex
12 if m=2 then poke s,h:s=s+1:goto 18
13 if m=0 then s=h:x=h:rem notstor/setadr
14 a=1:if m goto 17

15 if a then print:z=x/256 and 255:gosub 20:z=x-z*256:gosub 20:print ": ";:rem nxtprnt
16 z=peek(x):gosub 20:print " ";:rem prdata
17 m=0:if x<h then x=x+1:a=x/8=int(x/8):goto 15:rem xamnext/mod8chk

18 if y<=len(i$) goto 3
19 goto 2

20 p=z/16 and 15:gosub 22
21 p=z and 15:gosub 22:return

22 if p>9 then p=p+7
23 print chr$(48+p);:return
