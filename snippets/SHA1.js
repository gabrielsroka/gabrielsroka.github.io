(async function () {
    const encoder = new TextEncoder();
    const data = encoder.encode('Okta123');
    const hash = await crypto.subtle.digest('SHA-1', data);
    const b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
    console.log(b64, b64 == 'I0B2GSVQ4L9Xrx+t4QNyfnAsG6k=');
})()