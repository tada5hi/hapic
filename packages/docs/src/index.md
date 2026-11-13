---
layout: page
pageClass: hc-home
title: hapic
description: A tiny HTTP client for TypeScript, built on fetch, with request and response hooks, transformers, authorization helpers and a family of typed service clients.

hero:
  eyebrow: HTTP API client for TypeScript
  title: fetch, with a
  highlight: pipeline.
  description: Hooks, transformers and typed errors around every request. Error hooks can recover or retry. One tiny client for Node, browsers and workers.
  primary:
    text: Get started
    link: /getting-started/
  install: npm i hapic
  meta:
    - MIT licensed
    - ESM only
    - Node, browser and workers
    - built on fetch

entries:
  eyebrow: Documentation
  title: Pick your way in
  items:
    - title: Getting Started
      description: Install hapic, create a client and send your first request.
      link: /getting-started/
      links:
        - text: Introduction
          link: /getting-started/
        - text: Installation
          link: /getting-started/installation
        - text: Quick Start
          link: /getting-started/quick-start
    - title: Guide
      description: Every part of the client explained, from hooks and errors to testing.
      link: /guide/
      links:
        - text: Hooks
          link: /guide/hooks
        - text: Error Handling
          link: /guide/errors
        - text: Testing
          link: /guide/testing
    - title: Packages
      description: Typed clients for Harbor, Loki, OAuth2, Vault and VictoriaLogs.
      link: /packages/
      links:
        - text: Harbor
          link: /packages/harbor
        - text: Vault
          link: /packages/vault
        - text: OAuth2
          link: /packages/oauth2

hooks:
  eyebrow: Hooks and recovery
  title: Hooks that can rewrite the outcome
  description: hapic runs your hooks around the whole request lifecycle. An error hook is special. Return a Response to swallow the failure, or fresh RequestOptions to retry, and the client runs the request again for you. Token refresh, backoff and fallbacks become a handful of lines.
  points:
    - "request: change options, inject headers or add transformers before dispatch"
    - "response: normalize or unwrap the payload of every 2xx and 3xx response"
    - "requestError and responseError: recover with a Response, or retry with new options"
    - "on() and off(): register many hooks, remove one by id or all of them by name"
  action:
    text: Read the hooks guide
    link: /guide/hooks
  code: |
    // auth.ts
    import { createClient, isClientErrorWithStatusCode } from 'hapic';

    const client = createClient({ baseURL: 'https://api.example.com/' });

    // Recover from a 401 by refreshing the token, then retry
    client.on('responseError', async (error) => {
        if (isClientErrorWithStatusCode(error, 401)) {
            const token = await refreshAccessToken();

            const headers = new Headers(error.request.headers);
            headers.set('authorization', `Bearer ${token}`);

            // returning RequestOptions runs the original request again
            return { ...error.request, headers };
        }

        // anything else keeps throwing
        throw error;
    });

features:
  eyebrow: Features
  title: One client, batteries included
  description: A small, predictable core with everything a real HTTP layer needs already wired in.
  items:
    - title: Tiny, built on fetch
      description: A thin wrapper over the platform fetch, with a base URL and shortcuts for get, post, put, patch, delete and head.
    - title: Transformers
      description: Shape the outgoing body with transform and the decoded data with responseTransform, per request or for the whole client.
    - title: Errors that throw
      description: Any 4xx or 5xx response throws a typed error carrying the request, the response and its status. Guards like isClientError work across bundled copies.
    - title: Timeouts and abort
      description: Set a timeout per request or per client and combine it with your own abort signal. A timed out request fails with the code ETIMEDOUT.
    - title: Runs everywhere
      description: One code path for Node, the browser and worker runtimes. fetch, Headers, Blob and FormData resolve per environment.
    - title: Testable
      description: Pass a MemoryTransport to the client. It records every request and answers it with your handler, while hooks and decoding run as usual.

codeTabs:
  eyebrow: From zero to request
  title: From install to first request
  description: No client builders, no interceptor registries. A function call and a few options.
  tabs:
    - label: Install
      code: npm install hapic
    - label: Configure
      code: |
        // client.ts
        import { createClient } from 'hapic';

        export const client = createClient({
            baseURL: 'https://api.example.com/',
        });

        // attach a bearer token for every request
        client.setAuthorizationHeader({
            type: 'Bearer',
            token: process.env.API_TOKEN!,
        });
    - label: Request
      code: |
        import { client } from './client';

        // GET: data is decoded for you
        const { data } = await client.get<User[]>('users');

        // POST: body is serialized, Content-Type set
        const created = await client.post('users', { name: 'Peter' });

        // DELETE
        await client.delete(`users/${created.data.id}`);
    - label: Handle errors
      code: |
        import { isClientErrorWithStatusCode } from 'hapic';
        import { client } from './client';

        try {
            await client.get('users/404');
        } catch (error) {
            if (isClientErrorWithStatusCode(error, 404)) {
                // the server answered with 404, handle it
                console.warn('not found');
            }
        }

packages:
  eyebrow: The family
  title: A client for the services you already run
  description: Each package extends the same Client with a typed API for one service.
---

<script setup>
import Home from './.vitepress/theme/components/home/Home.vue';
</script>

<Home />
