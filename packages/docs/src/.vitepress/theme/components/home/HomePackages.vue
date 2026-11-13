<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import { data as cards } from '../../data/packages.data.mts';
import type { HomeFrontmatter } from './types';

const { frontmatter } = useData();

const head = computed(() => (frontmatter.value as HomeFrontmatter).packages);
</script>

<template>
    <section class="hc-section">
        <div class="hc-wrap">
            <p class="hc-eyebrow">
                {{ head.eyebrow }}
            </p>
            <h2 class="hc-heading">
                {{ head.title }}
            </h2>
            <p
                v-if="head.description"
                class="hc-lead"
            >
                {{ head.description }}
            </p>
            <div class="hc-packages">
                <article
                    v-for="card in cards"
                    :key="card.link"
                    class="hc-card hc-package"
                    :style="{ '--hc-accent': card.accent }"
                >
                    <h3 class="hc-package-name">
                        <a :href="withBase(card.link)">{{ card.name }}</a>
                    </h3>
                    <p class="hc-package-summary">
                        {{ card.summary }}
                    </p>
                </article>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hc-packages {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
}

@media (min-width: 640px) {
    .hc-packages {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 960px) {
    .hc-packages {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 1152px) {
    .hc-packages {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

.hc-package {
    position: relative;
    overflow: hidden;
    padding: 22px 18px 20px;
    transition: border-color 0.2s;
}

.hc-package::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--hc-accent, var(--vp-c-brand-1));
}

.hc-package:hover {
    border-color: var(--hc-accent, var(--vp-c-brand-1));
}

.hc-package-name {
    margin: 0 0 8px;
    font-family: var(--hc-font-mono);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.hc-package-name a {
    color: var(--vp-c-text-1);
    text-decoration: none;
}

/* The name link stays the card's single link; its stretched ::after makes the
 * whole card (position: relative above) the click target. */
.hc-package-name a::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 14px;
}

.hc-package:hover .hc-package-name a {
    color: var(--vp-c-brand-1);
}

.hc-package-name a:focus-visible {
    outline: none;
}

.hc-package-name a:focus-visible::after {
    outline: 2px solid var(--hc-color-accent-500);
    outline-offset: -2px;
}

.hc-package-summary {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}
</style>
