<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import SiteFooter from './components/layout/SiteFooter.vue';

const DefaultLayout = DefaultTheme.Layout;
</script>

<template>
    <DefaultLayout>
        <template #layout-bottom>
            <SiteFooter />
        </template>
    </DefaultLayout>
</template>
