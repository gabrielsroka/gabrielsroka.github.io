var tab = 2;

const get = fetch;

async function getJson(url, init) {
    const r = await fetch(url, init);
    return r.json();
}

document.querySelectorAll('script[type="text/pith"]').forEach(s => run(s.innerText));

function run(lines) {
    lines = lines.split('\n');
    var ind = 0;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        const tLine = line.trim();
        if (tLine.startsWith('for ')) {
            line = line
                .replace('for', 'for (var')
                .replace(' in ', ' of ');
            line += ')';
        } else if (tLine.startsWith('while ')) {
            line = line.replace('while ', 'while (') + ')';
        } else if (tLine.startsWith('def ') || tLine.startsWith('async def ')) {
            if (line.endsWith(' main')) line = 'main()\n' + line;
            line = line.replace('def', 'function');
            if (!line.endsWith(')')) line += '()';
        } else if (tLine.startsWith('if ') || tLine.startsWith('else if ') || tLine.startsWith('elif ')) {
            line = line
                .replace('elif', 'else if')
                .replace('if ', 'if (');
            line += ')';
        } else if (tLine.startsWith('#')) {
            line = line.replace('#', '//');
        } else if (tLine.startsWith('print ') || tLine.startsWith('?')) {
            line = line.replace(/(print|\?) ?/, 'print(') + ')';
        } else if (tLine.startsWith('>')) {
            line = line.replace('>', 'results.innerHTML +=') + ` + '<br>'`;
        } else if (tLine.startsWith('|')) {
            line = line.replace('|', 'table.tHead.innerHTML += `<tr><th>').replaceAll('|', '<th>') + '`';
        } else if (tLine.startsWith('+')) {
            line = line.replace('+', 'table.tBodies[0].innerHTML += `<tr><td>` + ').replaceAll('|', '+ `<td>` +').replaceAll('^', '+ `<td align=center>` +').replaceAll('>>', '+ `<td align=right>` +');
        } else if (tLine.startsWith('tab = ')) {
            eval(line);
            line = '// ' + line;
        }
        var newInd = line.match(/^( *)/)[1].length / tab;
        for (var t = newInd; t < ind; t++) {
            line = ' '.repeat(tab * t) + '}\n' + line;
        }
        if (newInd > ind) lines[i - 1] += ' {';
        ind = newInd;
        lines[i] = line;
    }
    lines = '(async function () {\n' + lines.join('\n') + '\n}'.repeat(ind) + '\n})()';
    console.log(lines);
    eval(lines);
    //document.body.appendChild(document.createElement("script")).innerHTML = lines;
}

function* range(start, stop, step = 1) {
    if (stop == undefined) {
        stop = start;
        start = 0;
    }
    while (start < stop) {
        yield start;
        start += step;
    }
}

function ac(it, cond, fn) {
    return [...gen(it, cond, fn)];
}

function* gen(it, cond, fn) {
    for (const n of it) {
        if (cond == undefined || cond(n)) {
            yield fn ? fn(n) : n;
        }
    }
}

function sum(it) {
    var total = 0;
    for (const n of it) {
        total += n;
    }
    return total;
}
