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
import { toHref } from './href';

const { frontmatter } = useData();

const hooks = computed(() => (frontmatter.value as HomeFrontmatter).hooks);

/*
 * A point reads "name: text"; the name is set in mono. A point without a
 * colon is rendered as plain text.
 */
const points = computed(() => hooks.value.points.map((point) => {
    const index = point.indexOf(': ');
    if (index === -1) {
        return { name: '', text: point };
    }

    return { name: point.slice(0, index), text: point.slice(index + 2) };
}));
</script>

<template>
    <section class="hc-section hc-section-alt">
        <div class="hc-wrap hc-hooks">
            <div>
                <p class="hc-eyebrow">
                    {{ hooks.eyebrow }}
                </p>
                <h2 class="hc-heading">
                    {{ hooks.title }}
                </h2>
                <p
                    v-if="hooks.description"
                    class="hc-lead"
                >
                    {{ hooks.description }}
                </p>
                <ul class="hc-hooks-points">
                    <li
                        v-for="(point, index) in points"
                        :key="index"
                    >
                        <strong v-if="point.name">{{ point.name }}</strong>
                        <span>{{ point.text }}</span>
                    </li>
                </ul>
                <a
                    class="hc-btn hc-btn-primary"
                    :href="toHref(hooks.action.link)"
                >{{ hooks.action.text }} <span aria-hidden="true">→</span></a>
            </div>
            <pre class="hc-code hc-hooks-code"><code>{{ hooks.code }}</code></pre>
        </div>
    </section>
</template>

<style scoped>
.hc-hooks {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
    align-items: center;
}

@media (min-width: 960px) {
    .hc-hooks {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
        gap: 56px;
    }
}

.hc-hooks-points {
    margin: 0 0 28px;
    padding: 0;
    list-style: none;
}

.hc-hooks-points li {
    padding: 10px 0;
    border-bottom: 1px solid var(--vp-c-divider);
    font-size: 14px;
    line-height: 1.55;
    color: var(--vp-c-text-2);
}

.hc-hooks-points li:last-child {
    border-bottom: none;
}

.hc-hooks-points strong {
    display: block;
    font-family: var(--hc-font-mono);
    font-size: 13px;
    font-weight: 600;
    color: var(--vp-c-brand-1);
}

.hc-hooks-code {
    box-shadow: 0 30px 60px -30px rgba(79, 70, 229, 0.5);
}
</style>
