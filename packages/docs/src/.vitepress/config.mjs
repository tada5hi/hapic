import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'HAPIC',
    base: '/',
    themeConfig: {
        socialLinks: [
            { icon: 'github', link: 'https://github.com/tada5hi/hapic' },
        ],
        editLink: {
            pattern: 'https://github.com/tada5hi/hapic/edit/master/docs/:path',
            text: 'Edit this page on GitHub'
        },
        nav: [
            {
                text: 'Home',
                link: '/',
                activeMatch: '/',
            },
            {
                text: 'Guide',
                link: '/guide/',
                activeMatch: '/guide/',
            }
        ],
        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    collapsible: false,
                    items: [
                        {text: 'What is it?', link: '/guide/'},
                        {text: 'Installation', link: '/guide/installation'},
                    ]
                },
                {
                    text: 'Essentials',
                    collapsible: false,
                    items: [
                        {text: 'Instance', link: '/guide/instance'},
                        {text: 'Request Methods', link: '/guide/request-methods'},
                        {text: 'Hooks', link: '/guide/hooks'},
                    ]
                }
            ]
        }
    }
});
