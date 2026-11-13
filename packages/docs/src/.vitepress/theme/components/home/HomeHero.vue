<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useData } from 'vitepress';
import type { HomeFrontmatter } from './types';

const { frontmatter } = useData();

const hero = computed(() => (frontmatter.value as HomeFrontmatter).hero);

const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;

const copyInstall = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return;
    }

    try {
        await navigator.clipboard.writeText(hero.value.install);
    } catch {
        return;
    }

    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copied.value = false;
    }, 1500);
};

onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
    <section class="hc-hero">
        <div class="hc-wrap hc-hero-inner">
            <p class="hc-eyebrow hc-hero-eyebrow">
                {{ hero.eyebrow }}
            </p>
            <h1 class="hc-hero-title">
                {{ hero.title }} <span class="hc-gradient-text">{{ hero.highlight }}</span>
            </h1>
            <p class="hc-lead hc-hero-lead">
                {{ hero.description }}
            </p>
            <div class="hc-hero-actions">
                <a
                    class="hc-btn hc-btn-primary"
                    :href="hero.primary.link"
                >{{ hero.primary.text }}</a>
                <button
                    type="button"
                    class="hc-btn hc-btn-ghost hc-hero-install"
                    :aria-label="copied ? 'Copied' : `Copy ${hero.install}`"
                    @click="copyInstall"
                >
                    {{ copied ? 'Copied' : hero.install }}
                </button>
            </div>
            <p class="hc-hero-meta">
                {{ hero.meta.join(' · ') }}
            </p>
            <slot />
        </div>
    </section>
</template>

<style scoped>
.hc-hero {
    position: relative;
    overflow: hidden;
    padding: 72px 0 56px;
    background-color: var(--hc-dark-bg);
    background-image:
        linear-gradient(rgba(129, 140, 248, 0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(129, 140, 248, 0.07) 1px, transparent 1px);
    background-size: 44px 44px;
    color: var(--hc-dark-fg);
}

@media (min-width: 960px) {
    .hc-hero {
        padding: 136px 0 72px;
    }
}

.hc-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
        radial-gradient(700px 320px at 75% 10%, rgba(99, 102, 241, 0.35), transparent 70%),
        radial-gradient(500px 300px at 10% 100%, rgba(6, 182, 212, 0.22), transparent 70%);
}

.hc-hero-inner {
    position: relative;
    z-index: 1;
}

.hc-hero-eyebrow {
    color: var(--hc-color-accent-400);
}

.hc-hero-title {
    margin: 12px 0 16px;
    font-size: clamp(40px, 8vw, 64px);
    font-weight: 800;
    line-height: 1.04;
    letter-spacing: -0.035em;
    color: #ffffff;
}

.hc-hero-lead {
    color: var(--hc-dark-fg-muted);
}

.hc-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.hc-hero-install {
    min-width: 9em;
    justify-content: center;
    border-color: var(--hc-dark-border);
    font-family: var(--hc-font-mono);
    font-weight: 500;
    color: var(--hc-dark-fg);
}

.hc-hero-install:hover {
    border-color: var(--hc-color-primary-400);
}

.hc-hero-meta {
    margin: 18px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--hc-dark-fg-muted);
}
</style>
