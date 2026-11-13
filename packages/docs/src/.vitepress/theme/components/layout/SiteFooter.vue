<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import { data as packages } from '../../data/packages.data.mts';

type FooterLink = { text: string, link: string };

type SiteFooterConfig = {
    tagline: string,
    license: string,
    copyright: string,
    project: FooterLink[],
};

const { theme } = useData();

const footer = computed(() => theme.value.siteFooter as SiteFooterConfig);

const docs = computed<FooterLink[]>(() => (theme.value.nav || [])
    .filter((item: Record<string, unknown>) => typeof item.text === 'string' && typeof item.link === 'string')
    .map((item: FooterLink) => ({ text: item.text, link: item.link })));

const isExternal = (link: string) => /^https?:\/\//.test(link);
</script>

<template>
    <footer class="hc-footer">
        <div class="hc-wrap hc-footer-grid">
            <div class="hc-footer-brand">
                <a
                    class="hc-footer-logo"
                    :href="withBase('/')"
                >
                    <img
                        :src="withBase('/logo.svg')"
                        alt=""
                        aria-hidden="true"
                        width="24"
                        height="24"
                    >
                    <span>hapic</span>
                </a>
                <p>{{ footer.tagline }}</p>
                <p>{{ footer.license }}</p>
                <p>{{ footer.copyright }}</p>
            </div>
            <nav
                class="hc-footer-col"
                aria-label="Docs"
            >
                <p class="hc-footer-heading">Docs</p>
                <ul>
                    <li
                        v-for="item in docs"
                        :key="item.link"
                    >
                        <a
                            v-if="isExternal(item.link)"
                            :href="item.link"
                            target="_blank"
                            rel="noopener"
                        >{{ item.text }}</a>
                        <a
                            v-else
                            :href="withBase(item.link)"
                        >{{ item.text }}</a>
                    </li>
                </ul>
            </nav>
            <nav
                class="hc-footer-col"
                aria-label="Packages"
            >
                <p class="hc-footer-heading">Packages</p>
                <ul>
                    <li
                        v-for="item in packages"
                        :key="item.link"
                    >
                        <a :href="withBase(item.link)">{{ item.name }}</a>
                    </li>
                </ul>
            </nav>
            <nav
                class="hc-footer-col"
                aria-label="Project"
            >
                <p class="hc-footer-heading">Project</p>
                <ul>
                    <li
                        v-for="item in footer.project"
                        :key="item.link"
                    >
                        <a
                            v-if="isExternal(item.link)"
                            :href="item.link"
                            target="_blank"
                            rel="noopener"
                        >{{ item.text }}</a>
                        <a
                            v-else
                            :href="withBase(item.link)"
                        >{{ item.text }}</a>
                    </li>
                </ul>
            </nav>
        </div>
    </footer>
</template>

<style scoped>
.hc-footer {
    position: relative;
    /*
     * Below 960px the sidebar is a drawer (--vp-z-index-sidebar: 60) over a
     * backdrop (50); the footer stays at VitePress's own footer level (10),
     * under the sticky local nav (20) as well.
     */
    z-index: var(--vp-z-index-footer);
    border-top: 1px solid var(--hc-dark-border);
    padding: 40px 0 32px;
    background-color: var(--hc-dark-bg);
    color: var(--hc-dark-fg-muted);
    font-size: 13px;
    line-height: 1.6;
}

@media (min-width: 960px) {
    .hc-footer {
        /*
         * From 960px up the sidebar is fixed with --vp-z-index-sidebar: 25 and
         * the nav sits at 30: paint the full width band above the sidebar and
         * below the nav.
         */
        z-index: 26;
    }
}

.hc-footer-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
}

@media (min-width: 480px) {
    .hc-footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .hc-footer-brand {
        grid-column: 1 / -1;
    }
}

@media (min-width: 768px) {
    .hc-footer-grid {
        grid-template-columns: 1.6fr 1fr 1fr 1fr;
        gap: 24px;
    }

    .hc-footer-brand {
        grid-column: auto;
    }
}

.hc-footer-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--hc-dark-fg-strong);
    text-decoration: none;
}

.hc-footer-brand p {
    max-width: 280px;
    margin: 0;
}

.hc-footer-heading {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.4;
    text-transform: uppercase;
    color: var(--hc-dark-fg-strong);
}

.hc-footer-col ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.hc-footer-col li {
    line-height: 1.9;
}

.hc-footer a {
    color: var(--hc-dark-fg-muted);
    text-decoration: none;
    transition: color 0.2s;
}

.hc-footer .hc-footer-logo {
    color: var(--hc-dark-fg-strong);
}

.hc-footer a:hover {
    color: var(--hc-color-accent-400);
}

.hc-footer a:focus-visible {
    outline: 2px solid var(--hc-color-accent-400);
    outline-offset: 2px;
    border-radius: 4px;
}
</style>
