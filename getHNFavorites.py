#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup

username = input('username: ')

base = 'https://news.ycombinator.com/'
path = 'favorites?id=' + username
while path:
    r = requests.get(base + path)
    s = BeautifulSoup(r.text, 'html.parser')
    for a in s.select('a.storylink'):
        print(a.text, a['href'])
    more = s.select_one('a.morelink')
    path = more['href'] if more else None
