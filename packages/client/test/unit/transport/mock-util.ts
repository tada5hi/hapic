/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

type FakeResponse = {
    status?: number,
    statusText?: string,
    headers?: string,
    body?: string
};

/**
 * A minimal XMLHttpRequest stand-in: records what is sent and lets a test
 * drive upload progress, the response, a network error or an abort.
 */
export class FakeXMLHttpRequest extends EventTarget {
    static instances : FakeXMLHttpRequest[] = [];

    static onSend : ((xhr: FakeXMLHttpRequest) => void) | undefined;

    upload = new EventTarget();

    method : string | undefined;

    url : string | undefined;

    responseType = '';

    withCredentials = false;

    requestHeaders : Record<string, string> = {};

    body : unknown;

    aborted = false;

    status = 0;

    statusText = '';

    response : ArrayBuffer | null = null;

    responseURL = '';

    protected responseHeaders = '';

    constructor() {
        super();

        FakeXMLHttpRequest.instances.push(this);
    }

    static reset() {
        FakeXMLHttpRequest.instances = [];
        FakeXMLHttpRequest.onSend = undefined;
    }

    open(method: string, url: string) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(key: string, value: string) {
        this.requestHeaders[key.toLowerCase()] = value;
    }

    getAllResponseHeaders() {
        return this.responseHeaders;
    }

    send(body: unknown) {
        this.body = body;

        if (FakeXMLHttpRequest.onSend) {
            FakeXMLHttpRequest.onSend(this);
        }
    }

    abort() {
        this.aborted = true;
        this.dispatchEvent(new Event('abort'));
    }

    progress(loaded: number, total?: number) {
        this.upload.dispatchEvent(Object.assign(new Event('progress'), {
            loaded,
            total: total ?? 0,
            lengthComputable: typeof total === 'number',
        }));
    }

    respond(input: FakeResponse = {}) {
        this.status = input.status ?? 200;
        this.statusText = input.statusText ?? 'OK';
        this.responseHeaders = input.headers ?? '';
        this.response = typeof input.body === 'string' ?
            new TextEncoder().encode(input.body).buffer as ArrayBuffer :
            null;
        this.dispatchEvent(new Event('load'));
    }

    fail() {
        this.dispatchEvent(new Event('error'));
    }
}
