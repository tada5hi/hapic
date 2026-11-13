<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import type { HomeFrontmatter } from './types';

const { frontmatter } = useData();

const entries = computed(() => (frontmatter.value as HomeFrontmatter).entries);

const number = (index: number) => String(index + 1).padStart(2, '0');
</script>

<template>
    <section class="hc-section">
        <div class="hc-wrap">
            <p class="hc-eyebrow">
                {{ entries.eyebrow }}
            </p>
            <h2 class="hc-heading">
                {{ entries.title }}
            </h2>
            <p
                v-if="entries.description"
                class="hc-lead"
            >
                {{ entries.description }}
            </p>
            <div class="hc-entries">
                <article
                    v-for="(item, index) in entries.items"
                    :key="item.link"
                    class="hc-card hc-entry"
                >
                    <p
                        class="hc-entry-number"
                        aria-hidden="true"
                    >
                        {{ number(index) }}
                    </p>
                    <h3 class="hc-entry-title">
                        <a :href="item.link">{{ item.title }}</a>
                    </h3>
                    <p class="hc-entry-text">
                        {{ item.description }}
                    </p>
                    <ul class="hc-entry-links">
                        <li
                            v-for="link in item.links"
                            :key="link.link"
                        >
                            <a :href="link.link"><span
                                class="hc-entry-arrow"
                                aria-hidden="true"
                            >→</span>{{ link.text }}</a>
                        </li>
                    </ul>
                </article>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-entries {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 28px;
}

@media (min-width: 768px) {
    .hc-entries {
        grid-template-columns: repeat(3, 1fr);
    }
}

.hc-entry {
    position: relative;
    overflow: hidden;
    padding: 24px;
}

.hc-entry::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-image: var(--hc-gradient);
}

.hc-entry-number {
    margin: 0;
    font-family: var(--hc-font-mono);
    font-size: 12px;
    color: var(--vp-c-text-3);
}

.hc-entry-title {
    margin: 8px 0 6px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
}

.hc-entry-title a {
    color: var(--vp-c-text-1);
    text-decoration: none;
}

.hc-entry-title a:hover {
    color: var(--vp-c-brand-1);
}

.hc-entry-text {
    margin: 0 0 14px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}

.hc-entry-links {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
    line-height: 1.9;
}

.hc-entry-links a {
    color: var(--vp-c-text-1);
    text-decoration: none;
}

.hc-entry-links a:hover {
    color: var(--vp-c-brand-1);
}

.hc-entry a:focus-visible {
    outline: 2px solid var(--hc-color-accent-500);
    outline-offset: 2px;
    border-radius: 4px;
}

.hc-entry-arrow {
    margin-right: 6px;
    color: var(--hc-color-accent-600);
}

.dark .hc-entry-arrow {
    color: var(--hc-color-accent-400);
}
</style>
