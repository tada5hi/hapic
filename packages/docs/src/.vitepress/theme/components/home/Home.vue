<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import PackageShowcase from '../PackageShowcase.vue';
import HomeCodeTabs from './HomeCodeTabs.vue';
import HomeEntries from './HomeEntries.vue';
import HomeFeatures from './HomeFeatures.vue';
import HomeHero from './HomeHero.vue';
import HomeHooks from './HomeHooks.vue';
import HomePipeline from './HomePipeline.vue';
</script>

<template>
    <div class="hc-home-root">
        <HomeHero>
            <HomePipeline />
        </HomeHero>
        <HomeEntries />
        <HomeHooks />
        <HomeFeatures />
        <HomeCodeTabs />
        <PackageShowcase />
    </div>
</template>
