<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
interface Feature {
    icon: string;
    title: string;
    detail: string;
}

const features: Feature[] = [
    {
        icon: '✨',
        title: 'Tiny & fetch-based',
        detail: 'A thin wrapper over the platform fetch — no axios-sized footprint. Method shortcuts (get / post / put / patch / delete / head) and a baseURL are all you need to start.',
    },
    {
        icon: '🛑',
        title: 'Request & response hooks',
        detail: 'Intercept every request, response, and error. An error hook can return a Response to recover, or new RequestOptions to retry — token refresh in a few lines.',
    },
    {
        icon: '🔄',
        title: 'Transformers',
        detail: 'Shape the outgoing body and headers, or normalize incoming data, with per-request or per-client transformer functions that compose in order.',
    },
    {
        icon: '❌',
        title: 'Errors that throw',
        detail: 'Any 4xx/5xx becomes a typed ClientError carrying the request, response and status. Duck-typed guards (isClientError*) work across bundled copies.',
    },
    {
        icon: '🌐',
        title: 'Runs everywhere',
        detail: 'One code path for Node.js, the browser, and worker runtimes — fetch, Headers, Blob, FormData and proxy support resolve per environment. Ships ESM + CJS.',
    },
    {
        icon: '🧩',
        title: 'A family of clients',
        detail: 'Harbor, Loki, OAuth2, Vault and VictoriaLogs clients extend the same Client with typed, domain-oriented APIs — share one transport, drop the boilerplate.',
    },
];
</script>

<template>
    <section class="hc-features">
        <div class="hc-features-inner">
            <h2 class="hc-features-heading">
                One client. Batteries included.
            </h2>
            <p class="hc-features-sub">
                A small, predictable core — and everything you reach for in a real HTTP layer already wired in.
            </p>
            <div class="hc-features-grid">
                <article
                    v-for="f in features"
                    :key="f.title"
                    class="hc-feature"
                >
                    <div class="hc-feature-icon">
                        {{ f.icon }}
                    </div>
                    <h3 class="hc-feature-title">
                        {{ f.title }}
                    </h3>
                    <p class="hc-feature-detail">
                        {{ f.detail }}
                    </p>
                </article>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-features {
    padding: 4rem 1.5rem;
    background: var(--hc-color-bg);
}

.hc-features-inner {
    max-width: 1152px;
    margin: 0 auto;
}

.hc-features-heading {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
    text-align: center;
}

.hc-features-sub {
    text-align: center;
    color: var(--hc-color-fg-muted);
    max-width: 38rem;
    margin: 0 auto 2.5rem;
}

.hc-features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
}

@media (min-width: 640px) { .hc-features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px) { .hc-features-grid { grid-template-columns: repeat(3, 1fr); } }

.hc-feature {
    padding: 1.5rem;
    border: 1px solid var(--hc-color-border);
    border-radius: 0.75rem;
    background: var(--hc-color-bg);
    transition: border-color 120ms, transform 120ms;
}
.hc-feature:hover {
    border-color: var(--hc-color-primary-500);
    transform: translateY(-2px);
}

.hc-feature-icon {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
    line-height: 1;
}

.hc-feature-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
}

.hc-feature-detail {
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--hc-color-fg-muted);
    margin: 0;
}
</style>
