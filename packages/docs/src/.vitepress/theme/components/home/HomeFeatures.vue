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

const features = computed(() => (frontmatter.value as HomeFrontmatter).features);

const number = (index: number) => String(index + 1).padStart(2, '0');
</script>

<template>
    <section class="hc-section">
        <div class="hc-wrap">
            <p class="hc-eyebrow">
                {{ features.eyebrow }}
            </p>
            <h2 class="hc-heading">
                {{ features.title }}
            </h2>
            <p
                v-if="features.description"
                class="hc-lead"
            >
                {{ features.description }}
            </p>
            <ul class="hc-features">
                <li
                    v-for="(item, index) in features.items"
                    :key="item.title"
                    class="hc-feature"
                >
                    <span
                        class="hc-feature-number"
                        aria-hidden="true"
                    >{{ number(index) }}</span>
                    <h3 class="hc-feature-title">
                        {{ item.title }}
                    </h3>
                    <p class="hc-feature-text">
                        {{ item.description }}
                    </p>
                </li>
            </ul>
        </div>
    </section>
</template>

<style scoped>
.hc-features {
    display: grid;
    grid-template-columns: 1fr;
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--vp-c-divider);
    border-left: 1px solid var(--vp-c-divider);
}

@media (min-width: 640px) {
    .hc-features {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 960px) {
    .hc-features {
        grid-template-columns: repeat(3, 1fr);
    }
}

.hc-feature {
    padding: 24px;
    border-right: 1px solid var(--vp-c-divider);
    border-bottom: 1px solid var(--vp-c-divider);
}

.hc-feature-number {
    font-family: var(--hc-font-mono);
    font-size: 12px;
    color: var(--vp-c-brand-1);
}

.hc-feature-title {
    margin: 6px 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--vp-c-text-1);
}

.hc-feature-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--vp-c-text-2);
}
</style>
