1 rem list basic
2 poke53280,13
3 poke53281,1
4 print"{black}"

!- globals: ls
!- locals
20 dim a,c,l$,e,t,t$
60 dim l,h,q:qt=34:tl=128:b=127
70 dim ls,j,i,bo,k$:pg=23
!- arrays should go last
90 ts=75:dim t$(ts),l$(80)


!- copy basic rom tokens to t$()
110 for a=41118to41372
120 c=peek(a)
130 ifcandtlthenc=candb:e=1
140 t$=t$+chr$(c)
150 ife=.goto180
160 print"{clear}loading token"t"of"ts;t$
170 e=.:t$(t)=t$:t$="":t=t+1
180 next


!- copy basic lines to l$()
310 a=2049
320 print"{clear}";

!- address of next line
400 l=peek(a):a=a+1:h=peek(a):a=a+1
430 ifl=.and h=. goto700
!- basic line number
450 l=peek(a):a=a+1
460 h=peek(a):a=a+1
480 l$=mid$(str$(l+h*256),2)+" "
485 print"{home}line " l$
490 q=.

!- main line loop. line ends w/ 0
500 c=peek(a):a=a+1
520 ifcandtlthenif not q thenl$=l$+t$(candb):goto500
530 ifc=.thenl$(ls)=l$:ls=ls+1:goto400
540 ifc=qtthenq=notq
550 l$=l$+chr$(c)
560 goto500


!- print and kbd
700 print"{clear}";
720 ifj>ls-pgthenj=ls-pg
730 ifj<.thenj=.
740 for i=0topg-1
750 ifi+j<ls thenprintl$(i+j)
760 next
770 bo=j+pg
780 ifbo>ls thenbo=ls
790 print j+1 "-" bo "of" ls "(h)elp";

800 getk$
810 ifk$=""goto800
820 ifk$="{up}"thenj=j-1:goto700
830 ifk$="{down}"thenj=j+1:goto700
840 ifk$="{left}"thenj=j-pg:goto700
850 ifk$="{right}"thenj=j+pg:goto700
860 ifk$="{home}"thenj=.:goto700
870 ifk$="{delete}"thenj=ls:goto700
880 ifk$="x"ork$="q"goto970
890 ifk$="h"goto910
900 goto800

910 print
920 print"up dn - scroll 1 line"
930 print"lt rt - scroll 1 page"
940 print"hm dl - scroll to top/end"
950 print"x q - exit";
960 goto800

970 print"{left*15}";
980 print"{space*15}{up}";
