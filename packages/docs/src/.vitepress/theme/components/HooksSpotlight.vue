<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
const code = `// auth.ts
import { createClient, isClientErrorWithStatusCode } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

// Recover from a 401 by refreshing the token, then retry
client.on('responseError', async (error) => {
    if (isClientErrorWithStatusCode(error, 401)) {
        const token = await refreshAccessToken();

        // returning RequestOptions re-runs the original request
        return {
            ...error.request,
            headers: {
                ...error.request.headers,
                authorization: \`Bearer \${token}\`,
            },
        };
    }

    // anything else keeps throwing
    throw error;
});`;
</script>

<template>
    <section class="hc-spot">
        <div class="hc-spot-inner">
            <div class="hc-spot-text">
                <p class="hc-spot-eyebrow">
                    hooks &amp; recovery
                </p>
                <h2 class="hc-spot-heading">
                    Hooks that can rewrite the outcome
                </h2>
                <p class="hc-spot-tagline">
                    hapic runs your hooks around the whole request lifecycle. An <code>error</code> hook
                    is special: return a <code>Response</code> to swallow the failure, or fresh
                    <code>RequestOptions</code> to retry — the client recurses for you. Token refresh,
                    backoff, and fallbacks become a handful of lines.
                </p>
                <ul class="hc-spot-list">
                    <li><strong>request</strong> — mutate options, inject headers, add transformers before dispatch</li>
                    <li><strong>response</strong> — normalize or unwrap payloads on every 2xx/3xx</li>
                    <li><strong>requestError / responseError</strong> — recover with a Response, or retry with new options</li>
                    <li><strong>on() / off()</strong> — register many hooks, remove one by id or all by name</li>
                </ul>
                <a
                    class="hc-btn hc-btn-primary"
                    href="/guide/hooks"
                >Read the hooks guide →</a>
            </div>

            <div class="hc-spot-code">
                <div class="hc-spot-code-toolbar">
                    <span>auth.ts</span>
                </div>
                <pre><code>{{ code }}</code></pre>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-spot {
    padding: 4rem 1.5rem;
    background: var(--hc-color-bg);
}
.hc-spot-inner {
    max-width: 1152px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;
}
@media (min-width: 960px) {
    .hc-spot-inner { grid-template-columns: 1fr 1fr; gap: 4rem; }
}

.hc-spot-eyebrow {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--hc-color-primary-500);
    margin: 0 0 0.75rem;
    font-family: ui-monospace, monospace;
}

.hc-spot-heading {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 1rem;
}

.hc-spot-tagline {
    font-size: 1.0625rem;
    line-height: 1.6;
    color: var(--hc-color-fg-muted);
    margin: 0 0 1.25rem;
}
.hc-spot-tagline code {
    background: var(--hc-color-bg-elevated);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
    font-family: ui-monospace, monospace;
}

.hc-spot-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
}
.hc-spot-list li {
    padding: 0.5rem 0;
    color: var(--hc-color-fg);
    font-size: 0.9375rem;
    border-bottom: 1px solid var(--hc-color-border-muted);
}
.hc-spot-list li:last-child { border-bottom: none; }
.hc-spot-list strong {
    color: var(--hc-color-primary-500);
    font-weight: 600;
    font-family: ui-monospace, monospace;
}

.hc-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none !important;
    transition: background-color 120ms;
}
.hc-btn-primary {
    background: var(--hc-color-primary-600);
    color: var(--hc-color-on-primary);
}
.hc-btn-primary:hover { background: var(--hc-color-primary-500); }

.hc-spot-code {
    border: 1px solid var(--hc-color-border);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--hc-color-bg);
}
.hc-spot-code-toolbar {
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--hc-color-border);
    font-size: 0.75rem;
    color: var(--hc-color-fg-muted);
    font-family: ui-monospace, monospace;
    background: var(--hc-color-bg-elevated);
}
.hc-spot-code pre {
    margin: 0;
    padding: 1.25rem;
    overflow-x: auto;
    font-size: 0.8125rem;
    line-height: 1.65;
    color: var(--hc-color-fg);
}
.hc-spot-code code { font-family: ui-monospace, monospace; }
</style>
