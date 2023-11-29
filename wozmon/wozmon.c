#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <ctype.h>

#if defined(_WINDOWS) || defined(_MSC_VER) || defined(__MinGW__)
#ifndef _WINDOWS
#define _WINDOWS
#endif
#include <windows.h>
#else
#include <sys/mman.h>
#endif

#ifndef PAGE_SIZE
#define PAGE_SIZE 4096
#endif

#define MEM_SIZE         (64 * 1024)
#define ALIGN(X,A)       (((X) + (A-1)) / (A) * (A))
#define MEM_SIZE_ALIGNED ALIGN(MEM_SIZE, PAGE_SIZE)

static unsigned char *mem = NULL;

int main() { // with help from ChatGPT 3.5
    bool escape = true;
    char in[128];
    int st = 0;
    int xam = 0;

#if defined(_WINDOWS)
    mem = VirtualAlloc(
        NULL,
        MEM_SIZE_ALIGNED,
        MEM_RESERVE|MEM_COMMIT,
        PAGE_EXECUTE_READWRITE
    );
    if (!mem) {
        fprintf(stderr, "VirtualAlloc failed, GLE=0x%x\n", GetLastError());
        return 1;
    }
#else
    mem = mmap(
        NULL,
        MEM_SIZE_ALIGNED,
        PROT_READ|PROT_WRITE|PROT_EXEC,
        MAP_ANON,
        -1,
        0);
    if (mem == MAP_FAILED) {
        perror("mmap failed");
        return 1;
    }
#endif

    while (true) {
        if (escape) {
            printf("\\"); // escape
            escape = false;
        }
        printf("\n"); // getline
        fgets(in, sizeof(in), stdin); // nextchar
        int y = 0;
        char mode = 'x'; // setmode, x=xam, b=block, s=store
        while (in[y] != '\0') {
            char c = in[y]; // nextitem
            if (c < '.') y++; // blskip-ish
            else if (c == '.') {
                mode = 'b';
                y++;
            } else if (c == ':') {
                mode = 's';
                y++;
            } else if (c == 'r') break; // run, not implemented
            else {
                int hx = 0;
                int ysav = y;
                while (in[y] != '\0') {
                    char c = in[y]; // nexthex
                    if (isdigit(c) || (c >= 'a' && c <= 'f')) {
                        char s[] = {c, 0};
                        hx = hx * 16 + strtol(s, NULL, 16); // dig
                    } else break;
                    y++;
                }
                if (y == ysav) {
                    escape = true; // nothex
                    break;
                }
                if (mode == 's') {
                    mem[st] = hx;
                    st++;
                    continue;
                }
                if (mode == 'x') { // notstor
                    st = hx; // setadr
                    xam = hx;
                }
                bool addr = true;
                while (true) {
                    if (mode == 'x') { // hack
                        if (addr) // nxtprnt
                            printf("\n%04x:", xam);
                        printf(" %02x", mem[xam]); // prdata
                    }
                    mode = 'x'; // xamnext
                    if (hx == xam) break;
                    xam++;
                    addr = xam % 8 == 0; // mod8chk
                }
            }
        }
    }
    return 0;
}
