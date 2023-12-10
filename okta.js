// import * as okta from './okta.js';

let baseUrl;
let _options;

export function init(url, options = {}) {
    baseUrl = url;
    _options = options;
}

export async function get(path) {
    return fetchOkta(path, {method: 'GET'});
}

export async function post(path, body) {
    return fetchOkta(path, {method: 'POST', body: JSON.stringify(body)});
}

export async function put(path, body) {
    return fetchOkta(path, {method: 'PUT', body: JSON.stringify(body)});
}

async function fetchOkta(path, init) {
    init.headers['Content-Type'] = 'application/json';
    return fetch(baseUrl + path, {..._options, ...init});
}
