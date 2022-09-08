javascript:
/* Bookmarklet name: /console#
url: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/console.js */
(function () {
 div = document.body.appendChild(document.createElement('div'));
 div.innerHTML = `<button id=run>Run</button>
  <button onclick=document.body.removeChild(this.parentNode)>Close</button><br>
  <textarea id=editor style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none>
f = 'filter=profile.lastName eq "Doe"'\n
url = '/api/v1/users?limit=2&' + f\n
for await (users of getPages(url))\n
  for (user of users)\n
    log(user.id, user.profile.login)</textarea><br>
  <textarea id=debug style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none></textarea>`;
 div.style.cssText = 'position: absolute; padding: 8px; width: 100%; top: 0px; background-color: white; z-index: 1001;';
 run.onclick = function () {
  debug.value = '';
  eval('(async function () {' + editor.value + '})()');
 };
 function log(...s) {
  debug.value += s.join(' ') + '\n';
 }
 async function* getPages(url) {
  while (url) {
   const r = await fetch(url);
   const page = await r.json();
   yield page;
   url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
  }
 }
 async function get(url) {
  const r = await fetch(url);
  return await r.json();
 }
 const headers = {
  'Content-Type': 'application/json',
  'X-Okta-XsrfToken': document.getElementById('_xsrfToken').innerText
 }
 async function post(url, body) {
  const r = await fetch(url, {method: 'post', body: JSON.stringify(body), headers});
  return await r.json();
 }
 async function put(url, body) {
  const r = await fetch(url, {method: 'put', body: JSON.stringify(body), headers});
  return await r.json();
 }
 async function remove(url) {
  return await fetch(url, {method: 'delete', headers});
 }
})()
