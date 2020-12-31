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
8 l$(ls)=l$:ls=ls+1
9 next


!- print and kbd
70 print"{clear}";
71 ifj>ls-pgthenj=ls-pg
72 ifj<.thenj=.
73 for i=.topg-1
74 ifi+j<ls thenprintl$(i+j)
75 next
76 bo=j+pg
77 ifbo>ls thenbo=ls
78 print j+1 "-" bo "of" ls "(h)elp";

80 getk$:ifk$=""goto80
81 ifk$="{up}"thenj=j-1:goto70
82 ifk$="{down}"thenj=j+1:goto70
83 ifk$="{left}"thenj=j-pg:goto70
84 ifk$="{right}"thenj=j+pg:goto70
85 ifk$="{home}"thenj=.:goto70
86 ifk$="{delete}"thenj=ls:goto70
87 ifk$="x"ork$="q"goto97
88 ifk$="h"goto90
89 goto80

90 print
92 print"up dn - scroll 1 line"
93 print"lt rt - scroll 1 page"
94 print"hm dl - scroll to top/end"
95 print"x q - exit";
96 goto80

97 print"{left*15}";
98 print"{space*15}{up}";
99 end


!- start
100 poke53280,13:poke53281,1:print"{black}"

!- globals: ls
!- locals (most frequently used first)
110 dim a,c,l$,t,t$,q
120 qt=34:tk=128:b=127:h=256
130 dim ls,j,i,bo,k$:pg=23
!- arrays (should go last)
150 ts=75:dim t$(ts),l$(50)


!- copy basic tokens from rom to t$()
200 fora=41118to41372
210 c=peek(a):t$=t$+chr$(candb)
220 ifcandtkthenprint"{clear}loading token"t"of"ts:t$(t)=t$:t$="":t=t+1
230 next

300 print"{clear}";:return
