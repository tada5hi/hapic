# Docs site design notes

## Direction

The hero's signature is something only hapic has: its own request pipeline, animated on a dark technical
surface, including the error hooks that recover or retry. The sections below stay quiet so the pipeline remains
the eye catcher. VitePress 1.6 default theme, plain CSS, no Tailwind, no extra dependencies.

## Palette and surfaces

- Tokens live in `src/.vitepress/theme/style.css`: the `--hc-*` scale (indigo primary, cyan accent, as in the
  logo), warning and error, and the bridge to `--vp-c-brand-*`. The scenario chips use accent, warning and error.
- The hero, the footer and `.hc-code` blocks use the `--hc-dark-*` tokens and stay dark in both colour
  modes. All other landing sections follow the colour mode.

## The pipeline motif

`HomePipeline.vue` and `HomePipelineDiagram.vue` draw `request → hooks → transform → fetch → decode → hooks →
response` plus an `error hooks` node below the track. Scenario paths and outcome lines are defined in
`HomePipeline.vue`, not in frontmatter, because they describe client behaviour. They must stay in agreement
with `packages/client/assets/request-lifecycle.svg` and with `packages/client/src/module.ts` (response hooks
run only on success, a 4xx/5xx leaves after decode, a failed dispatch leaves at fetch). When the lifecycle
changes, update the diagram, the scenarios and their outcome lines together. Motion stops under
`prefers-reduced-motion` and with the pause button; the initial scenario is fixed so SSR and hydration agree.

## Copy rule

Landing page and footer headings and prose contain no hyphen (`-`), en dash (U+2013) or em dash (U+2014), and
neither do the site `description` and `og:` texts in `config.mjs`. Rephrase instead ("fetch-based" becomes
"built on fetch"). Package names, code, CLI commands and URLs keep theirs. Check codepoints, not looks.

## Where copy lives

- Landing page: frontmatter of `src/index.md` (`hero`, `entries`, `hooks`, `features`, `codeTabs`,
  `packages`). Components hold no marketing sentences. Types are in `theme/components/home/types.ts`.
- Footer prose and the Project links: `themeConfig.siteFooter` in `config.mjs`. The Docs column is
  `themeConfig.nav`, the Packages column is the packages loader.
- Package cards: the `package:` frontmatter of each `src/packages/<name>.md`.

## Adding a landing section

1. Add a frontmatter key to `src/index.md` and its type to `HomeFrontmatter` in `types.ts`.
2. Create `theme/components/home/Home<Name>.vue` reading it via `useData().frontmatter`; use the shared
   classes `hc-section` (or `hc-section-alt`), `hc-wrap`, `hc-eyebrow`, `hc-heading`, `hc-lead`.
3. Mount it in `Home.vue`, keeping page and soft backgrounds (`hc-section` / `hc-section-alt`) alternating.

## Adding a package card

Give `src/packages/<name>.md` frontmatter `package: { name, summary, accent, order }` and add the page to the
sidebar in `config.mjs`. `theme/data/packages.data.mts` loads every `packages/*.md` except the index and
`theme/data/packages.ts` validates it; a missing or wrong field fails the build naming the page and the key.

## Nav and footer wiring

- The landing page sets `pageClass: hc-home`. The unlayered overrides at the end of `style.css`, scoped to
  `.Layout.hc-home`, make the nav transparent over the hero at the top of the page and pull the hero under
  the fixed nav from 960px up. Other pages keep the opaque nav.
- `theme/Layout.vue` wraps the default layout and mounts `components/layout/SiteFooter.vue` in the
  `layout-bottom` slot on every page; its z-index values come from VitePress 1.6.4, recheck them on upgrade.
