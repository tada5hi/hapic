<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();

interface MethodDef {
    name: 'get' | 'post' | 'put' | 'patch' | 'delete';
    label: string;
    color: string;
    payload: boolean;
    status: number;
    statusText: string;
}

const methods: MethodDef[] = [
    { name: 'get', label: 'GET', color: 'var(--hc-method-get)', payload: false, status: 200, statusText: 'OK' },
    { name: 'post', label: 'POST', color: 'var(--hc-method-post)', payload: true, status: 201, statusText: 'Created' },
    { name: 'put', label: 'PUT', color: 'var(--hc-method-put)', payload: true, status: 200, statusText: 'OK' },
    { name: 'patch', label: 'PATCH', color: 'var(--hc-method-patch)', payload: true, status: 200, statusText: 'OK' },
    { name: 'delete', label: 'DELETE', color: 'var(--hc-method-delete)', payload: false, status: 204, statusText: 'No Content' },
];

const state = reactive({
    method: methods[0] as MethodDef,
    url: 'users/2',
});

const body = `{ name: 'Peter' }`;

const call = computed(() => {
    const m = state.method;
    // serialize the user-typed endpoint so a stray quote/newline can't produce
    // invalid copyable code
    const endpoint = JSON.stringify(state.url);
    if (m.payload) {
        return `await client.${m.name}(${endpoint}, ${body});`;
    }
    return `await client.${m.name}(${endpoint});`;
});

const responseBody = computed(() => {
    const m = state.method;
    if (m.name === 'delete') {
        return '';
    }
    if (m.name === 'get') {
        return JSON.stringify({ id: 2, name: 'Peter', active: true }, null, 2);
    }
    if (m.name === 'post') {
        return JSON.stringify({ id: 3, name: 'Peter' }, null, 2);
    }
    return JSON.stringify({ id: 2, name: 'Peter' }, null, 2);
});

const select = (m: MethodDef) => {
    state.method = m;
};

const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;
const copy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
        await navigator.clipboard.writeText(call.value);
    } catch {
        return;
    }
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = false; }, 1500);
};

const toggleDark = () => {
    isDark.value = !isDark.value;
};
</script>

<template>
    <section class="hc-hero">
        <div class="hc-hero-inner">
            <div class="hc-hero-text">
                <h1 class="hc-hero-title">
                    <span class="hc-hero-title-grad">hapic</span>
                </h1>
                <p class="hc-hero-tagline">
                    A tiny, <strong>fetch</strong>-based HTTP client for TypeScript — request &amp; response hooks,
                    transformers, authorization helpers and automatic error throwing. One transport,
                    a family of typed service clients on top.
                </p>
                <div class="hc-hero-actions">
                    <a
                        class="hc-btn hc-btn-primary"
                        href="/getting-started/"
                    >Get Started</a>
                    <a
                        class="hc-btn hc-btn-ghost"
                        href="https://github.com/tada5hi/hapic"
                        target="_blank"
                        rel="noopener"
                    >View on GitHub</a>
                </div>
                <p class="hc-hero-meta">
                    MIT licensed · Node 16+ · Browser &amp; Workers · ESM + CJS · Zero-config
                </p>
            </div>

            <div class="hc-hero-card">
                <div class="hc-hero-card-toolbar">
                    <span
                        class="hc-hero-card-dot"
                        style="background: var(--hc-color-error-500)"
                    />
                    <span
                        class="hc-hero-card-dot"
                        style="background: var(--hc-color-warning-500)"
                    />
                    <span
                        class="hc-hero-card-dot"
                        style="background: var(--hc-color-success-500)"
                    />
                    <span class="hc-hero-card-title">hapic — request playground</span>
                    <button
                        class="hc-hero-card-toggle"
                        type="button"
                        @click="toggleDark"
                    >
                        {{ isDark ? 'Dark' : 'Light' }}
                    </button>
                </div>

                <div class="hc-hero-card-body">
                    <div class="hc-hero-methods">
                        <button
                            v-for="m in methods"
                            :key="m.name"
                            type="button"
                            class="hc-hero-method"
                            :class="{ 'hc-hero-method-active': state.method.name === m.name }"
                            :style="{ '--m': m.color }"
                            @click="select(m)"
                        >
                            {{ m.label }}
                        </button>
                    </div>

                    <label class="hc-hero-field">
                        <span class="hc-hero-field-label">endpoint</span>
                        <input
                            v-model="state.url"
                            class="hc-hero-input"
                            spellcheck="false"
                            placeholder="users/2"
                        >
                    </label>

                    <pre class="hc-hero-code"><code>{{ call }}</code></pre>

                    <div class="hc-hero-output">
                        <div class="hc-hero-output-head">
                            <span
                                class="hc-hero-status"
                                :style="{ color: state.method.color }"
                            >{{ state.method.status }} {{ state.method.statusText }}</span>
                            <button
                                type="button"
                                class="hc-hero-copy"
                                @click="copy"
                            >{{ copied ? 'Copied' : 'Copy' }}</button>
                        </div>
                        <pre
                            v-if="responseBody"
                            class="hc-hero-output-pre"
                        ><code>{{ responseBody }}</code></pre>
                        <p
                            v-else
                            class="hc-hero-output-empty"
                        >// empty body — resource removed</p>
                    </div>

                    <p class="hc-hero-card-hint">
                        Every method returns a <code>Response</code> whose <code>data</code> is decoded for you.
                        Non-2xx responses throw a <code>ClientError</code> you can catch — or recover from inside a hook.
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-hero {
    padding: 4rem 1.5rem 3rem;
    background:
        radial-gradient(1200px 600px at 100% 0%, color-mix(in oklab, var(--hc-color-primary-500) 12%, transparent), transparent),
        radial-gradient(800px 400px at 0% 100%, color-mix(in oklab, var(--hc-color-accent-500) 10%, transparent), transparent);
}

.hc-hero-inner {
    max-width: 1152px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;
}

@media (min-width: 960px) {
    .hc-hero-inner { grid-template-columns: 1fr 1fr; gap: 4rem; }
}

.hc-hero-title {
    font-size: clamp(2.75rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 1.25rem;
}
.hc-hero-title-grad {
    background: linear-gradient(120deg, var(--hc-color-primary-500), var(--hc-color-accent-500));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.hc-hero-tagline {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--hc-color-fg-muted);
    max-width: 36rem;
    margin: 0 0 2rem;
}
.hc-hero-tagline strong { color: var(--hc-color-fg); font-weight: 600; }

.hc-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.hc-hero-meta {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--hc-color-fg-muted);
}

.hc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.95rem;
    border: 1px solid transparent;
    transition: background-color 120ms, color 120ms, border-color 120ms;
    cursor: pointer;
    text-decoration: none !important;
}

.hc-btn-primary {
    background: var(--hc-color-primary-600);
    color: var(--hc-color-on-primary);
}
.hc-btn-primary:hover { background: var(--hc-color-primary-500); }

.hc-btn-ghost {
    background: transparent;
    color: var(--hc-color-fg);
    border-color: var(--hc-color-border);
}
.hc-btn-ghost:hover {
    background: var(--hc-color-bg-elevated);
    border-color: var(--hc-color-fg-muted);
}

.hc-hero-card {
    border: 1px solid var(--hc-color-border);
    border-radius: 1rem;
    background: var(--hc-color-bg);
    box-shadow: 0 25px 50px -12px color-mix(in oklab, var(--hc-color-primary-500) 8%, rgba(0,0,0,0.25));
    overflow: hidden;
}

.hc-hero-card-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--hc-color-border);
    background: var(--hc-color-bg-elevated);
}
.hc-hero-card-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 999px;
    display: inline-block;
}
.hc-hero-card-title {
    font-size: 0.75rem;
    color: var(--hc-color-fg-muted);
    font-family: ui-monospace, monospace;
    margin-left: 0.5rem;
}
.hc-hero-card-toggle {
    margin-left: auto;
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--hc-color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--hc-color-fg-muted);
    cursor: pointer;
}
.hc-hero-card-toggle:hover { color: var(--hc-color-fg); }

.hc-hero-card-body { padding: 1.25rem; }

.hc-hero-methods {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 1rem;
}
.hc-hero-method {
    --m: var(--hc-color-primary-500);
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--hc-color-border);
    background: transparent;
    color: var(--hc-color-fg-muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    font-family: ui-monospace, monospace;
    cursor: pointer;
    transition: color 120ms, border-color 120ms, background-color 120ms;
}
.hc-hero-method:hover { color: var(--m); border-color: var(--m); }
.hc-hero-method-active {
    color: var(--hc-color-on-primary);
    background: var(--m);
    border-color: var(--m);
}

.hc-hero-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
}
.hc-hero-field-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--hc-color-fg-muted);
}
.hc-hero-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--hc-color-border);
    background: var(--hc-color-bg);
    color: var(--hc-color-fg);
    font-size: 0.875rem;
    font-family: ui-monospace, monospace;
    transition: border-color 120ms;
}
.hc-hero-input:focus {
    outline: none;
    border-color: var(--hc-color-primary-500);
}

.hc-hero-code {
    margin: 0 0 1rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid var(--hc-color-border);
    background: var(--hc-color-bg-elevated);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--hc-color-primary-500);
    font-family: ui-monospace, monospace;
    overflow-x: auto;
}

.hc-hero-output {
    border: 1px solid var(--hc-color-border);
    border-radius: 0.5rem;
    background: var(--hc-color-bg-muted);
    overflow: hidden;
    margin-bottom: 1rem;
}
.hc-hero-output-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--hc-color-border);
    background: var(--hc-color-bg-elevated);
    font-size: 0.75rem;
}
.hc-hero-status {
    font-weight: 700;
    font-family: ui-monospace, monospace;
}
.hc-hero-copy {
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--hc-color-border);
    border-radius: 999px;
    background: transparent;
    font-size: 0.7rem;
    color: var(--hc-color-fg-muted);
    cursor: pointer;
}
.hc-hero-copy:hover { color: var(--hc-color-fg); }

.hc-hero-output-pre {
    margin: 0;
    padding: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--hc-color-fg);
    font-family: ui-monospace, monospace;
    overflow: auto;
    background: transparent;
}
.hc-hero-output-empty {
    margin: 0;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: var(--hc-color-fg-muted);
    font-family: ui-monospace, monospace;
}

.hc-hero-card-hint {
    font-size: 0.8125rem;
    color: var(--hc-color-fg-muted);
    margin: 0;
    line-height: 1.5;
}
.hc-hero-card-hint code {
    background: var(--hc-color-bg-elevated);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
    font-family: ui-monospace, monospace;
}
</style>
