!-load time: 3900->1687
0 gosub100


!- copy basic lines to l$()
1 fora=2050topeek(45)+h*peek(46)-2
!- basic line number
2 l$=mid$(str$(peek(a+1)+h*peek(a+2)),2)+" "
3 a=a+3:q=.:print"{home}line "l$

!- main line loop. line ends w/ 0
4 c=peek(a):a=a+1
5 ifcandtkthenifnotqthenl$=l$+t$(candb):goto4
6 ifc=qtthenq=notq
7 ifcthenl$=l$+chr$(c):goto4
8 l$(ls)=l$:l(ls)=int(len(l$)/40)+1:ls=ls+1
9 next

20 ?ti-t0"j."(ti-t0)/60"s"
21 ?"press any key"
22 remgetk$:ifk$=""goto22

!- print and kbd
30 a=.:print"{clear}";
32 ifj<.thenj=.
33 for i=jtoj+pg-1
34 ifi>=ls thenbo=i:i=j+pg:goto37
35 a=a+l(i):ifa>pg-1thenbo=i:i=j+pg:goto37
36 printl$(i)
37 next
38 ifbo>ls thenbo=ls
39 print chr$(13)" lines"str$(j+1);-bo "of" ls "- (h)elp";

50 getk$:ifk$=""goto50
51 ifk$="{up}"thenj=j-1:goto30
52 ifk$="{down}"thenj=j+1:goto30
53 ifk$="{left}"thenq=j-1:goto70
54 ifk$="{right}"thenj=bo:goto30
55 ifk$="{home}"thenj=.:goto30
56 ifk$="{delete}"thenq=ls-1:goto70
57 ifk$="x"ork$="q"goto90
58 ifk$="h"goto80
59 goto50

70 ifq<.goto30
71 a=.:c=pg-2:print"{clear}thinking..."
72 fori=qto.step-1
73 a=a+l(i):j=i:ifa>ctheni=.
74 next
75 goto30

80 print
81 print"up dn - scroll 1 line"
82 print"lt rt - scroll 1 page"
83 print"hm dl - scroll to top/end"
84 print"x q - exit";
85 goto50

90 print"{left*15}";
91 print"{space*15}{up}";
99 end


!- start
100 poke53280,13:poke53281,1:print"{black}"

!- globals: ls,l$(),l()
!- locals (most frequently used first)
110 dim a,c,l$,t,t$,q
120 qt=34:tk=128:b=127:h=256
130 dim ls,j,i,bo,k$:pg=24
140 t0=ti
!- arrays (should go last)
150 ts=75:lm=60:dim t$(ts),l$(lm),l(lm)


!- copy basic tokens from rom to t$()
200 fora=41118to41372
210 c=peek(a):t$=t$+chr$(candb)
220 ifcandtkthenprint"{clear}loading token"t"of"ts:t$(t)=t$:t$="":t=t+1
230 next

300 print"{clear}";:return
