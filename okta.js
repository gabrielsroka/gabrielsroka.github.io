// import * as okta from './okta.js';

let baseUrl;

export function init(url) {
    baseUrl = url;
}

export async function get(path) {
    return fetchOkta(path, {method: 'GET'});
}

export async function post(path, body) {
    return fetchOkta(path, {method: 'POST', body: JSON.stringify(body)});
}

async function fetchOkta(path, init) {
    return fetch(baseUrl + path, {...init, headers: {'Content-Type': 'application/json'}, credentials: 'include'});
}
