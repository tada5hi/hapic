<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
interface PackageCard {
    name: string;
    accent: string;
    href: string;
    summary: string;
    bullets: string[];
}

const packages: PackageCard[] = [
    {
        name: '@hapic/harbor',
        accent: 'var(--hc-color-accent-500)',
        href: '/packages/harbor',
        summary: 'Typed client for the Harbor container registry — projects, repositories, artifacts, robots and webhooks.',
        bullets: [
            'project · repository · artifact APIs',
            'robot account management',
            'connectionString auth',
        ],
    },
    {
        name: '@hapic/oauth2',
        accent: 'var(--hc-color-primary-500)',
        href: '/packages/oauth2',
        summary: 'OAuth2 / OpenID Connect client — authorize URLs, every token grant, introspection and userinfo.',
        bullets: [
            'client_credentials · password · code',
            'refresh · revoke · introspect',
            'OpenID discovery helper',
        ],
    },
    {
        name: '@hapic/vault',
        accent: '#a855f7',
        href: '/packages/vault',
        summary: 'HashiCorp Vault client — key-value v1 & v2 secret engines plus mount management.',
        bullets: [
            'keyValueV1 · keyValueV2',
            'versioned reads & CAS writes',
            'mount / unmount engines',
        ],
    },
    {
        name: '@hapic/loki',
        accent: '#f59e0b',
        href: '/packages/loki',
        summary: 'Grafana Loki client — push log streams and run LogQL instant & range queries.',
        bullets: [
            'distributor push / pushMany',
            'querier query / queryRange',
            'compactor deletion requests',
        ],
    },
    {
        name: '@hapic/victorialogs',
        accent: '#10b981',
        href: '/packages/victorialogs',
        summary: 'VictoriaLogs client — ingest JSON-line logs and query them with LogsQL.',
        bullets: [
            'ingestor insert',
            'querier query (LogsQL)',
            'streaming response parsing',
        ],
    },
    {
        name: 'hapic',
        accent: 'var(--hc-color-primary-600)',
        href: '/guide/',
        summary: 'The foundation. Build your own typed client on the same Client, hooks and instance registry.',
        bullets: [
            'extend Client',
            'compose domain *API classes',
            'reuse one transport',
        ],
    },
];
</script>

<template>
    <section class="hc-packages">
        <div class="hc-packages-inner">
            <h2 class="hc-packages-heading">
                A client for the services you already run
            </h2>
            <p class="hc-packages-sub">
                Each sibling package extends the base <code>Client</code> with a typed, domain-oriented API —
                same hooks, same auth helpers, same instance registry. Pick one, or roll your own.
            </p>

            <div class="hc-packages-grid">
                <a
                    v-for="p in packages"
                    :key="p.name"
                    :href="p.href"
                    class="hc-package-card"
                    :style="{ '--accent': p.accent }"
                >
                    <h3 class="hc-package-name">{{ p.name }}</h3>
                    <p class="hc-package-summary">{{ p.summary }}</p>
                    <ul class="hc-package-list">
                        <li
                            v-for="b in p.bullets"
                            :key="b"
                        >{{ b }}</li>
                    </ul>
                    <span class="hc-package-cta">Read more →</span>
                </a>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-packages {
    padding: 4rem 1.5rem;
    background: var(--hc-color-bg-muted);
}

.hc-packages-inner {
    max-width: 1152px;
    margin: 0 auto;
}

.hc-packages-heading {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: center;
    margin: 0 0 0.75rem;
}

.hc-packages-sub {
    text-align: center;
    max-width: 42rem;
    margin: 0 auto 2.5rem;
    color: var(--hc-color-fg-muted);
    line-height: 1.6;
}
.hc-packages-sub code {
    background: var(--hc-color-bg-elevated);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
    font-family: ui-monospace, monospace;
}

.hc-packages-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
}

@media (min-width: 640px) { .hc-packages-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px) { .hc-packages-grid { grid-template-columns: repeat(3, 1fr); } }

.hc-package-card {
    --accent: var(--hc-color-primary-500);
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border: 1px solid var(--hc-color-border);
    border-top: 3px solid var(--accent);
    border-radius: 0.75rem;
    background: var(--hc-color-bg);
    text-decoration: none !important;
    color: inherit;
    transition: transform 120ms, border-color 120ms;
}
.hc-package-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
}

.hc-package-name {
    font-size: 1.0625rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    font-family: ui-monospace, monospace;
}

.hc-package-summary {
    font-size: 0.9375rem;
    color: var(--hc-color-fg-muted);
    margin: 0 0 1rem;
    line-height: 1.5;
}

.hc-package-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem;
    flex: 1;
}
.hc-package-list li {
    padding: 0.375rem 0;
    font-size: 0.875rem;
    color: var(--hc-color-fg);
    border-bottom: 1px solid var(--hc-color-border-muted);
    font-family: ui-monospace, monospace;
}
.hc-package-list li:last-child { border-bottom: none; }
.hc-package-list li::before {
    content: '→';
    margin-right: 0.5rem;
    color: var(--accent);
    font-weight: 700;
}

.hc-package-cta {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
}
</style>
