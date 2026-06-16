<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
    label: string;
    code: string;
}

const tabs: Tab[] = [
    {
        label: 'Install',
        code: 'npm install hapic --save',
    },
    {
        label: 'Configure',
        code: `// client.ts
import { createClient } from 'hapic';

export const client = createClient({
    baseURL: 'https://api.example.com/',
});

// attach a bearer token for every request
client.setAuthorizationHeader({
    type: 'Bearer',
    token: process.env.API_TOKEN!,
});`,
    },
    {
        label: 'Request',
        code: `import { client } from './client';

// GET — data is decoded for you
const { data } = await client.get<User[]>('users');

// POST — body is serialized, Content-Type set
const created = await client.post('users', { name: 'Peter' });

// DELETE
await client.delete(\`users/\${created.data.id}\`);`,
    },
    {
        label: 'Handle errors',
        code: `import { isClientErrorWithStatusCode } from 'hapic';
import { client } from './client';

try {
    await client.get('users/404');
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        // the request never resolved with a 2xx — handle it
        console.warn('not found');
    }
}`,
    },
];

const active = ref(0);
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const copy = async (code: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
        await navigator.clipboard.writeText(code);
    } catch {
        return;
    }
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = false; }, 1500);
};
</script>

<template>
    <section class="hc-codetabs">
        <div class="hc-codetabs-inner">
            <h2 class="hc-codetabs-heading">
                From install to first request
            </h2>
            <p class="hc-codetabs-sub">
                No client builders, no interceptor registries — a function call and a few options.
            </p>

            <div class="hc-codetabs-card">
                <div
                    class="hc-codetabs-tabs"
                    role="tablist"
                >
                    <button
                        v-for="(tab, i) in tabs"
                        :key="tab.label"
                        type="button"
                        class="hc-codetabs-tab"
                        :class="{ 'hc-codetabs-tab-active': active === i }"
                        :aria-selected="active === i"
                        role="tab"
                        @click="active = i"
                    >
                        {{ tab.label }}
                    </button>
                    <button
                        type="button"
                        class="hc-codetabs-copy"
                        @click="copy(tabs[active].code)"
                    >
                        {{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
                <pre class="hc-codetabs-pre"><code>{{ tabs[active].code }}</code></pre>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-codetabs {
    padding: 4rem 1.5rem;
    background: var(--hc-color-bg);
}

.hc-codetabs-inner {
    max-width: 960px;
    margin: 0 auto;
}

.hc-codetabs-heading {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: center;
    margin: 0 0 0.5rem;
}

.hc-codetabs-sub {
    text-align: center;
    color: var(--hc-color-fg-muted);
    margin: 0 0 2rem;
}

.hc-codetabs-card {
    border: 1px solid var(--hc-color-border);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--hc-color-bg);
}

.hc-codetabs-tabs {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.5rem 0;
    border-bottom: 1px solid var(--hc-color-border);
    background: var(--hc-color-bg-elevated);
}

.hc-codetabs-tab {
    padding: 0.5rem 0.875rem;
    border: none;
    background: transparent;
    color: var(--hc-color-fg-muted);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem 0.375rem 0 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}
.hc-codetabs-tab:hover { color: var(--hc-color-fg); }
.hc-codetabs-tab-active {
    color: var(--hc-color-fg);
    border-bottom-color: var(--hc-color-primary-500);
    background: var(--hc-color-bg);
}

.hc-codetabs-copy {
    margin-left: auto;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--hc-color-border);
    border-radius: 0.375rem;
    background: transparent;
    font-size: 0.75rem;
    color: var(--hc-color-fg-muted);
    cursor: pointer;
    margin-bottom: 0.5rem;
    margin-right: 0.5rem;
}
.hc-codetabs-copy:hover { color: var(--hc-color-fg); }

.hc-codetabs-pre {
    padding: 1.25rem;
    margin: 0;
    overflow-x: auto;
    font-size: 0.8125rem;
    line-height: 1.6;
    background: var(--hc-color-bg);
    color: var(--hc-color-fg);
}
.hc-codetabs-pre code { font-family: ui-monospace, monospace; }
</style>
