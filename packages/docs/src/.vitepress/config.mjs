/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'hapic',
    description: 'A tiny, fetch-based HTTP client for TypeScript — request & response hooks, transformers, authorization helpers, and a family of typed service clients.',
    base: '/',
    cleanUrls: true,
    lastUpdated: true,

    head: [
        ['link', {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/logo.svg',
        }],
        ['meta', { name: 'theme-color', content: '#6366f1' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:title', content: 'hapic — HTTP API Client' }],
        ['meta', {
            property: 'og:description',
            content: 'A tiny, fetch-based HTTP client for TypeScript.',
        }],
    ],

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            {
                text: 'Getting Started',
                link: '/getting-started/',
                activeMatch: '/getting-started/',
            },
            {
                text: 'Guide',
                link: '/guide/',
                activeMatch: '/guide/',
            },
            {
                text: 'Packages',
                link: '/packages/',
                activeMatch: '/packages/',
            },
        ],

        sidebar: {
            '/getting-started/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/getting-started/' },
                        { text: 'Installation', link: '/getting-started/installation' },
                        { text: 'Quick Start', link: '/getting-started/quick-start' },
                    ],
                },
            ],
            '/guide/': [
                {
                    text: 'Concepts',
                    items: [
                        { text: 'Overview', link: '/guide/' },
                        { text: 'The Client', link: '/guide/client' },
                        { text: 'Instance Registry', link: '/guide/instance' },
                    ],
                },
                {
                    text: 'Making Requests',
                    items: [
                        { text: 'Request Methods', link: '/guide/request-methods' },
                        { text: 'Responses', link: '/guide/responses' },
                        { text: 'Headers & Authorization', link: '/guide/headers' },
                    ],
                },
                {
                    text: 'The Pipeline',
                    items: [
                        { text: 'Hooks', link: '/guide/hooks' },
                        { text: 'Transformers', link: '/guide/transformers' },
                        { text: 'Error Handling', link: '/guide/errors' },
                    ],
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Proxy & Environments', link: '/guide/proxy' },
                        { text: 'Building a Service Client', link: '/guide/building-a-client' },
                        { text: 'Testing', link: '/guide/testing' },
                    ],
                },
            ],
            '/packages/': [
                {
                    text: 'Packages',
                    items: [
                        { text: 'Overview', link: '/packages/' },
                        { text: '@hapic/harbor', link: '/packages/harbor' },
                        { text: '@hapic/oauth2', link: '/packages/oauth2' },
                        { text: '@hapic/vault', link: '/packages/vault' },
                        { text: '@hapic/loki', link: '/packages/loki' },
                        { text: '@hapic/victorialogs', link: '/packages/victorialogs' },
                    ],
                },
            ],
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/tada5hi/hapic' },
        ],

        editLink: {
            pattern: 'https://github.com/tada5hi/hapic/edit/master/packages/docs/src/:path',
            text: 'Edit this page on GitHub',
        },

        search: { provider: 'local' },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2021-present Peter Placzek',
        },
    },
});
