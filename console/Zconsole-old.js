javascript:
/*
Bookmarklet name: /console#

Setup:
Select all this code, then drag and drop or copy/paste it to your bookmark bar.

url: https://gabrielsroka.github.io/console

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
   eval('(async function () {' + editor.value + '\n})()');
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
 async function* getPages(url, params = '') {
   while (url) {
     const r = await get(url + params);
     const page = await r.json();
     yield page;
     url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
   }
 }
 async function* getObjects(url, params) {
   for await (const objects of getPages(url, params)) {
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
 function toCSV(...fields) {
   return fields.map(field => `"${field == undefined ? '' : field.toString().replace(/"/g, '""')}"`).join(',');
 }
 function downloadCSV(lines, filename) {
   var a = $('<a>').appendTo(div);
   a.attr('href', URL.createObjectURL(new Blob([lines], {type: 'text/csv'})));
   var date = (new Date()).toISOString().replace(/T/, ' ').replace(/:/g, '-').slice(0, 19);
   a.attr('download', `${filename} ${date}.csv`);
   a[0].click();
 }
})();
