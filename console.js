javascript:
/* Bookmarklet name: /console# */
(function () {
 div = document.body.appendChild(document.createElement('div'));
 div.innerHTML = `<button id=run>Run</button>
  <button onclick=document.body.removeChild(this.parentNode)>Close</button><br>
  <textarea id=editor style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none>
f = 'filter=profile.lastName eq "Doe"'\n
url = \`/api/v1/users?\${f}&limit=2\`\n
while (url) {\n
  r = await get(url)\n
  us = await r.json()\n
  for (u of us)\n
    log(u.profile.login)\n
  url = r.nextUrl\n
}
  </textarea><br>
  <textarea id=debug style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none></textarea>`;
 div.style.cssText = 'position: absolute; padding: 8px; width: 100%; top: 0px; background-color: white; z-index: 1001;';
 run.onclick = function () {
  debug.value = '';
  eval('(async function () {' + editor.value + '})()');
 };
 function log(s) {
  debug.value += s + '\n';
 }
 async function get(url) {
  const r = await fetch(url);
  r.nextUrl = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
  return r;
 }
 async function remove(url) {
  return await $.ajax(url, {method: 'delete'});
 }
})()
