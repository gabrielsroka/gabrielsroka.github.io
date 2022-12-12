javascript:
/*
Bookmarklet name: /console#
url: https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/console.js
*/
(function () {
 const div = document.body.appendChild(document.createElement('div'));
 div.innerHTML = `<button id=run>Run</button>
  <button onclick=document.body.removeChild(this.parentNode)>Close</button>
  <label><input id=preserveLog type=checkbox> Preserve Log</label>
  <a href=https://github.com/gabrielsroka/gabrielsroka.github.io/blob/master/console.js target=_blank>src</a><br>
  <textarea id=editor style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none>
f = 'filter=profile.lastName eq "Doe"'\n
url = '/api/v1/users?limit=2&' + f\n
for await (user of getObjects(url)) {\n
  log(user.id, user.profile.login)\n
}</textarea><br>
  <textarea id=debug style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none></textarea>
  <div id=results></div>`;
 div.style.cssText = 'position: absolute; padding: 8px; width: 100%; top: 0px; background-color: white; z-index: 1001;';
 run.onclick = function () {
   if (!preserveLog.checked) debug.value = '';
   eval('(async function () {' + editor.value + '})()');
 };
 editor.onkeydown = function (event) {
   const ENTER = 13;
   if (event.ctrlKey && event.keyCode == ENTER) {
     run.onclick();
   }
 };
 function log(...s) {
   debug.value += s.join(' ') + '\n';
   debug.scrollTo(0, debug.scrollHeight);
 }
 const headers = {
   'Accept': 'application/json',
   'Content-Type': 'application/json',
   'X-Okta-XsrfToken': _xsrfToken.innerText
 };
 async function* getPages(url) {
   while (url) {
     const r = await get(url);
     const page = await r.json();
     yield page;
     url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
   }
 }
 async function* getObjects(url) {
   for await (const objects of getPages(url)) {
     for (const o of objects) {
       yield o;
     }
   }
 }
 async function get(url) {
   return fetch(url, {method: 'get', headers});
 }
 async function getJson(url) {
   const r = await get(url);
   return r.json();
 }
 async function post(url, body) {
   return fetch(url, {method: 'post', headers, body: JSON.stringify(body)});
 }
 async function postJson(url, body) {
   const r = await post(url, body);
   return r.json();
 }
 async function put(url, body) {
   return fetch(url, {method: 'put', headers, body: JSON.stringify(body)});
 }
 async function putJson(url, body) {
   const r = await put(url, body);
   return r.json();
 }
 async function remove(url) {
   return fetch(url, {method: 'delete', headers});
 }
 function link(url, text) {
  return `<a href="${url}" target=_blank>${text}</a>`;
 }
})();
