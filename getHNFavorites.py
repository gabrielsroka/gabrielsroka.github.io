#!/usr/bin/env python3

import requests
import time
from bs4 import BeautifulSoup # pip install beautifulsoup4

username = input('username: ')

# session uses connection pooling, often resulting in faster execution.
session = requests.Session()

base = 'https://news.ycombinator.com/'
path = f'favorites?id={username}'
while path:
    r = session.get(base + path)
    s = BeautifulSoup(r.text, 'html.parser')
    for a in s.select('span.titleline a'):
        print(a.text, a['href'])
    more = s.select_one('a.morelink')
    path = more['href'] if more else None
    if path: time.sleep(0.850)
