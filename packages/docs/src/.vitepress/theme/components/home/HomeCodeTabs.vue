<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useData } from 'vitepress';
import type { HomeFrontmatter } from './types';
import { useCopy } from './use-copy';

const { frontmatter } = useData();

const codeTabs = computed(() => (frontmatter.value as HomeFrontmatter).codeTabs);

const active = ref(0);
// Indexed by tab position through a function ref; a v-for ref array does not guarantee source order.
const tabRefs: (HTMLButtonElement | null)[] = [];

const setTabRef = (index: number, el: unknown) => {
    tabRefs[index] = el instanceof HTMLButtonElement ? el : null;
};

const { copied, copy, reset } = useCopy();

const tabId = (index: number) => `hc-codetabs-tab-${index}`;
const panelId = 'hc-codetabs-panel';

const activate = async (index: number, focus = false) => {
    if (index !== active.value) {
        reset();
    }

    active.value = index;

    if (focus) {
        await nextTick();
        tabRefs[index]?.focus();
    }
};

const onKeydown = (event: KeyboardEvent) => {
    const count = codeTabs.value.tabs.length;
    let next: number;

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            next = (active.value + 1) % count;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            next = (active.value - 1 + count) % count;
            break;
        case 'Home':
            next = 0;
            break;
        case 'End':
            next = count - 1;
            break;
        default:
            return;
    }

    event.preventDefault();
    activate(next, true);
};
</script>

<template>
    <section class="hc-section hc-section-alt">
        <div class="hc-wrap hc-codetabs">
            <div>
                <p class="hc-eyebrow">
                    {{ codeTabs.eyebrow }}
                </p>
                <h2 class="hc-heading">
                    {{ codeTabs.title }}
                </h2>
                <p
                    v-if="codeTabs.description"
                    class="hc-lead"
                >
                    {{ codeTabs.description }}
                </p>
                <div
                    class="hc-codetabs-list"
                    role="tablist"
                    :aria-label="codeTabs.title"
                    @keydown="onKeydown"
                >
                    <button
                        v-for="(tab, index) in codeTabs.tabs"
                        :id="tabId(index)"
                        :key="tab.label"
                        :ref="(el) => setTabRef(index, el)"
                        type="button"
                        role="tab"
                        class="hc-codetabs-tab"
                        :aria-selected="active === index"
                        :aria-controls="panelId"
                        :tabindex="active === index ? 0 : -1"
                        @click="activate(index)"
                    >
                        {{ tab.label }}
                    </button>
                </div>
            </div>
            <div
                :id="panelId"
                class="hc-codetabs-panel"
                role="tabpanel"
                :aria-labelledby="tabId(active)"
            >
                <div class="hc-codetabs-bar">
                    <button
                        type="button"
                        class="hc-codetabs-copy"
                        @click="copy(codeTabs.tabs[active].code)"
                    >
                        {{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
                <pre class="hc-code"><code>{{ codeTabs.tabs[active].code }}</code></pre>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-codetabs {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    align-items: center;
}

@media (min-width: 960px) {
    .hc-codetabs {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
        gap: 56px;
    }
}

.hc-codetabs-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.hc-codetabs-tab {
    padding: 6px 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 999px;
    background-color: transparent;
    font-family: var(--hc-font-mono);
    font-size: 13px;
    line-height: 1.4;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}

.hc-codetabs-tab:hover {
    color: var(--vp-c-text-1);
}

.hc-codetabs-tab[aria-selected='true'] {
    border-color: var(--vp-c-brand-1);
    background-color: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
}

.hc-codetabs-panel {
    position: relative;
}

.hc-codetabs-bar {
    position: absolute;
    top: 10px;
    right: 10px;
}

.hc-codetabs-copy {
    padding: 4px 10px;
    border: 1px solid var(--hc-dark-border);
    border-radius: 6px;
    background-color: var(--hc-dark-bg);
    font-family: var(--hc-font-mono);
    font-size: 12px;
    line-height: 1.4;
    color: var(--hc-dark-fg-muted);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
}

.hc-codetabs-copy:hover {
    border-color: var(--hc-color-primary-400);
    color: var(--hc-dark-fg);
}

.hc-codetabs-tab:focus-visible,
.hc-codetabs-copy:focus-visible {
    outline: 2px solid var(--hc-color-accent-500);
    outline-offset: 2px;
}

.hc-codetabs-panel .hc-code {
    min-height: 120px;
    padding-top: 48px;
    box-shadow: 0 30px 60px -30px rgba(79, 70, 229, 0.5);
}
</style>
