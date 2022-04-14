javascript:
/* Bookmarklet name: /wordlecon# */
(function () {
 const btn = document.querySelector('game-app').shadowRoot.querySelector('.menu-left').appendChild(document.createElement('button'));
 btn.onclick = function () {
 const div = document.body.appendChild(document.createElement('div'));
 div.innerHTML = `<button id=run>Run</button>
  <button onclick=document.body.removeChild(this.parentNode)>Close</button><br>
  <textarea id=editor style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none></textarea><br>
  <textarea id=debug style='width: 100%; height: 300px; font-family: monospace;' spellcheck=false autocapitalize=none></textarea>`;
 div.style.cssText = 'position: absolute; padding: 8px; width: 100%; top: 0px; background-color: white; z-index: 1001;';
 editor.value = `sel = 'script[src*=main]';
s = document.querySelector(sel);
r = await fetch(s.src);
t = await r.text();
// log(t.match(/(..)...cigar/)[1]);
t = t.match(/mo=(\\[[^\\]]+])/)[1];
a = JSON.parse(t);
b = /...../;
m = '';
x = /[]/;
ws = a.filter(w => w.match(b) && Array.from(m).every(t => w.match(t)) && !w.match(x));
log(ws.sort().join(', '));
log(ws.length);`.replace(/;/g, ';\n');
 run.onclick = function () {
  debug.value = '';
  eval('(async function () {' + editor.value + '})()');
 };
 function log(s) {
  debug.value += s + '\n';
 }
};
 btn.innerHTML = '0';
 var time = 1;
 setInterval(() => {
  btn.innerHTML = time++;
 }, 1000);
})()
