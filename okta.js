export async function* getPages(url, params = '') {
    while (url) {
        const r = await get(url + params);
        const page = await r.json();
        yield page;
        url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
    }
}

export async function* getObjects(url, params) {
    for await (const objects of getPages(url, params)) {
        for (const o of objects) {
            yield o;
        }
    }
}

export async function get(url) {
    return fetch(url);
}

export async function getJson(url) {
    const r = await get(url);
    return r.json();
}
