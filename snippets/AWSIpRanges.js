// 1. in your browser, go to https://ip-ranges.amazonaws.com/ip-ranges.json
// 2. run this JavaScript

(function () {
    console.clear();

    const ranges = JSON.parse(document.body.innerText);
    const ips = {};
    var total = 0;
    var count = 0;
//     ranges.prefixes.sort((p1, p2) => p1.ip_prefix.localeCompare(p2.ip_prefix)).forEach(p => console.log(p.ip_prefix));
    ranges.prefixes.forEach(prefix => { // ranges.ipv6_prefixes has ipv6_prefix
        const [ip, range] = prefix.ip_prefix.split('/');
        if (!ips[ip]) {
            ips[ip] = true;
            total += 2 ** (32 - range);
            count++;
        }
    });
    console.log('ranges', count);
    console.log('addresses', total);
    console.log(Math.round(total * 100 * 100 / 2 ** 32, 2) / 100 + '%');
})();
