export async function getJson(url) {
    const r = await fetch(url);
    return r.json();
}
