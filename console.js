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
 const get = fetch;
 async function* getPages(url) {
  while (url) {
   const response = await fetch(url);
   const page = await response.json();
   yield page;
   url = response.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
  }
 }
 async function put(url, data) {
  return await $.ajax(url, {method: 'put', data: JSON.stringify(data), contentType: 'application/json'});
 }
 async function remove(url) {
  return await $.ajax(url, {method: 'delete'});
 }
})()
