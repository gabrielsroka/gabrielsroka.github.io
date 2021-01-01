!-load time: 3900->1687
0 gosub 100


!- copy basic lines to l$()
1 for a=2050 to peek(45)+h*peek(46)-2
!- basic line number
2 l$=mid$(str$(peek(a+1)+h*peek(a+2)),2)+" "
3 a=a+3:q=.:print"{home}line " l$

!- main line loop. line ends w/ 0
4 c=peek(a):a=a+1
5 if c and tk then if not q then l$=l$+t$(c and b):goto4
6 if c=qt then q=not q
7 if c then l$=l$+chr$(c):goto4
8 l$(ls)=l$:l(ls)=int(len(l$)/40)+1:ls=ls+1
9 next

20 ?ti-t0"j."(ti-t0)/60"s"
21 ?"press any key"
22 rem getk$:if k$="" goto22

!- print and kbd
30 a=.:print"{clear}";
32 if j<. then j=.
33 for i=j to j+pg-1
34 if i>=ls then bo=i:i=j+pg:goto37
35 a=a+l(i):if a>pg-1 then bo=i:i=j+pg:goto37
36 print l$(i)
37 next
38 if bo>ls then bo=ls
39 print chr$(13)" lines" str$(j+1);-bo "of" ls "- (h)elp";

50 get k$:if k$="" goto50
51 if k$="{up}" then j=j-1:goto30
52 if k$="{down}" then j=j+1:goto30
53 if k$="{left}" then q=j-1:goto70
54 if k$="{right}" then j=bo:goto30
55 if k$="{home}" then j=.:goto30
56 if k$="{delete}" then q=ls-1:goto70
57 if k$="x" or k$="q" goto90
58 if k$="h" goto80
59 goto50

70 if q<. goto30
71 a=.:c=pg-2:print"{clear}thinking..."
72 for i=q to . step -1
73 a=a+l(i):j=i:if a>c then i=.
74 next
75 goto30

80 print
81 print"up dn - scroll 1 line"
82 print"lt rt - scroll 1 page"
83 print"hm dl - scroll to top/end"
84 print"x q - exit";
85 goto50

90 print"{left*20}";
91 print"{space*20}{up}";
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
200 for a=41118 to 41372
210 c=peek(a):t$=t$+chr$(c and b)
220 if c and tk then print"{clear}loading token"t"of"ts:t$(t)=t$:t$="":t=t+1
230 next

300 print"{clear}";:return
