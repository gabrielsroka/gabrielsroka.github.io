mem = [0] * 64 * 1024
escape = True
def echo(s): print(s, end='')

while True:
    if escape: echo('\\'); escape = False # escape
    print() # getline
    inp = input() # nextchar
    y = 0
    mode = 'xam' # setmode
    while y < len(inp):
        c = inp[y] # nextitem
        if c < '.': y += 1 # blskip-ish
        elif c == '.':
            mode = 'block'; y += 1
        elif c == ':':
            mode = 'store'; y += 1
        elif c == 'r': break # run, not implemented
        else:
            hx = 0
            ysav = y
            while y < len(inp):
                c = inp[y] # nexthex
                if c.isdigit() or 'a' <= c <= 'f':
                    hx = hx * 16 + int(c, base=16) # dig
                else:
                    break
                y += 1
            if y == ysav: # nothex
                escape = True
                break
            if mode == 'store':
                mem[st] = hx
                st += 1
                continue
            if mode == 'xam': # notstor
                st = hx # setadr
                xam = hx
            addr = True
            while True:
                if mode == 'xam': # hack
                    if addr: # nxtprnt
                        echo(f'\n{xam:04x}:')
                    echo(f' {mem[xam]:02x}') # prdata
                mode = 'xam' # xamnext
                if hx == xam:
                    break
                xam += 1
                addr = xam % 8 == 0 # mod8chk
