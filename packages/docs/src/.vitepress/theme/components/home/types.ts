/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HomeLink = { text: string, link: string };

export type PipelineScenarioId = 'ok' | 'retry' | 'network' | 'timeout';

export type PipelineScenario = {
    id: PipelineScenarioId,
    label: string,
    outcome: string,
    exit: 'none' | 'decode' | 'fetch',
    result: 'response' | 'retry' | 'thrown',
};

export type PipelineExit = PipelineScenario['exit'];

export type PipelineLayoutId = 'h' | 'v';

export type HomeHeroData = {
    eyebrow: string,
    title: string,
    highlight: string,
    description: string,
    primary: HomeLink,
    install: string,
    meta: string[],
};

export type HomeSectionHead = { eyebrow: string, title: string, description?: string };

export type HomeEntriesData = HomeSectionHead & {
    items: { title: string, description: string, link: string, links: HomeLink[] }[],
};

export type HomeHooksData = HomeSectionHead & { points: string[], action: HomeLink, code: string };

export type HomeFeaturesData = HomeSectionHead & { items: { title: string, description: string }[] };

export type HomeCodeTabsData = HomeSectionHead & { tabs: { label: string, code: string }[] };

export type HomePackagesData = HomeSectionHead;

export type HomeFrontmatter = {
    hero: HomeHeroData,
    entries: HomeEntriesData,
    hooks: HomeHooksData,
    features: HomeFeaturesData,
    codeTabs: HomeCodeTabsData,
    packages: HomePackagesData,
};
