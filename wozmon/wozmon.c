#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <ctype.h>

#define MEM_SIZE (64 * 1024)

int main() { // with help from ChatGPT 3.5
    unsigned char mem[MEM_SIZE] = {0};
    bool escape = true;
    char in[128];
    int st = 0;
    int xam = 0;

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
                        hx = hx * 16 + strtol(&c, NULL, 16); // dig
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
                    if (xam >= hx) break;
                    xam++;
                    addr = xam % 8 == 0; // mod8chk
                }
            }
        }
    }
    return 0;
}
