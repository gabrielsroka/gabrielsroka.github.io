0 gosub 1000


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
53 if k$="{left}" then q=j-1:goto 100
54 if k$="{right}" then j=bo:goto 30
55 if k$="{home}" then j=.:goto 30
56 if k$="{delete}" then q=ls-1:goto 100
57 if k$="f" goto 200
58 if k$="g" goto 300
59 if k$="x" or k$="q" goto 900
60 if k$="h" goto 800
61 goto 50

100 if q<. goto 30
110 a=.:c=pg-2:print "{clear}thinking..."
120 for i=q to . step -1
130 a=a+l(i):j=i:if a>c then i=.
140 next
150 goto 30

200 input "{left*6}find ";l$:q=-1
210 for i=. to ls-1:for c=1 to len(l$(i))-len(l$)+1
220 if mid$(l$(i),c,len(l$))=l$ then q=i:i=ls-1
230 next:next
240 if q=-1 then print "{up} " l$ " not found{space*11}";:goto 50
250 j=q
260 goto 30

300 input "{left*6}line#";l$:q=-1:l$=l$+" "
310 for i=. to ls-1
320 if left$(l$(i),len(l$))=l$ then q=i:i=ls-1
330 next
340 if q=-1 then print "{up} line not found{space*11}";:goto 50
350 j=q
360 goto 30

800 print
810 print "up dn - scroll 1 line"
820 print "lt rt - scroll 1 page"
830 print "hm dl - scroll to top/end"
840 print "f - find"
850 print "g - go to line number" 
880 print "x q - exit";
890 goto 50

900 print "{left*20}";
910 print "{space*20}{up}";
920 end


!- start
1000 poke 53280,13:poke 53281,1:print "{black}"

!- globals: ls,l$(),l()
!- locals (most frequently used first)
1100 dim a,c,l$,t,t$,q
1200 qt=34:tk=128:b=127:h=256
1300 dim ls,j,i,bo,k$:pg=24
!- arrays (should go last)
1500 ts=75:lm=80:dim t$(ts),l$(lm),l(lm)


!- copy basic tokens from rom to t$()
2000 for a=41118 to 41372
2100 c=peek(a):t$=t$+chr$(c and b)
2200 if c and tk then print "{clear}loading token" t "of" ts:t$(t)=t$:t$="":t=t+1
2300 next

3000 print "{clear}";:return
