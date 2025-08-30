def main():
    code = {}
    prompt = True
    while True:
        try:
            s = input('Ready.\n' if prompt else '').strip()
        except Exception as e:
            break
        if s == '': 
            prompt = False
            continue
        if s == 'exit': break
        prompt = True
        if s[0] == '?':
            s = 'print(' + s[1:] + ')'
        if s == 'list' or s == 'lI':
            print()
            for n, ln in sorted(code.items()):
                print(n, ln)
        elif s == 'run':
            lines = '\n'.join(ln for _, ln in sorted(code.items()))
            run(lines)
        elif s == 'new':
            code = {}
            print()
        elif s[0].isdigit():
            ln = s[1:]
            if ln:
                code[s[0]] = ln
            else:
                del code[s[0]]
            prompt = False
        else:
            run(s)

def run(s):
    try:
        exec(s, globals())
    except Exception as e:
        print(e)
    print()

main()
