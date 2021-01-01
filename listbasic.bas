!-load time: 3900->1736
0 gosub 100


!- copy basic lines to l$()
1 for a=2050 to peek(45)+h*peek(46)-2
!- basic line number
2 l$=mid$(str$(peek(a+1)+h*peek(a+2)),2)+" "
3 a=a+3:q=.:print "{home}line " l$

!- main line loop. line ends w/ 0
4 c=peek(a):a=a+1
5 if c and tk then if not q then l$=l$+t$(c and b):goto 4
6 if c=qt then q=not q
7 if c then l$=l$+chr$(c):goto 4
8 l$(ls)=l$:l(ls)=int(len(l$)/40)+1:ls=ls+1
9 next


!- print and kbd
30 a=.:print"{clear}";
32 if j<. then j=.
33 for i=j to j+pg-1
34 if i>=ls then bo=i:i=j+pg:goto 37
35 a=a+l(i):if a>pg-1 then bo=i:i=j+pg:goto 37
36 print l$(i)
37 next
38 if bo>ls then bo=ls
39 print chr$(13)" lines" str$(j+1);-bo "of" ls "- (h)elp";

50 get k$:if k$="" goto 50
51 if k$="{up}" then j=j-1:goto 30
52 if k$="{down}" then j=j+1:goto 30
53 if k$="{left}" then q=j-1:goto 70
54 if k$="{right}" then j=bo:goto 30
55 if k$="{home}" then j=.:goto 30
56 if k$="{delete}" then q=ls-1:goto 70
57 if k$="x" or k$="q" goto 90
58 if k$="h" goto 80
59 goto 50

70 if q<. goto 30
71 a=.:c=pg-2:print "{clear}thinking..."
72 for i=q to . step -1
73 a=a+l(i):j=i:if a>c then i=.
74 next
75 goto 30

80 print
81 print "up dn - scroll 1 line"
82 print "lt rt - scroll 1 page"
83 print "hm dl - scroll to top/end"
84 print "x q - exit";
85 goto 50

90 print "{left*20}";
91 print "{space*20}{up}";
99 end


!- start
100 poke 53280,13:poke 53281,1:print "{black}"

!- globals: ls,l$(),l()
!- locals (most frequently used first)
110 dim a,c,l$,t,t$,q
120 qt=34:tk=128:b=127:h=256
130 dim ls,j,i,bo,k$:pg=24
!- arrays (should go last)
150 ts=75:lm=60:dim t$(ts),l$(lm),l(lm)


!- copy basic tokens from rom to t$()
200 for a=41118 to 41372
210 c=peek(a):t$=t$+chr$(c and b)
220 if c and tk then print "{clear}loading token" t "of" ts:t$(t)=t$:t$="":t=t+1
230 next

300 print "{clear}";:return
