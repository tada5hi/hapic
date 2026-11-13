<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script setup lang="ts">
import CodeTabs from '../CodeTabs.vue';
import FeatureGrid from '../FeatureGrid.vue';
import Hero from '../Hero.vue';
import HooksSpotlight from '../HooksSpotlight.vue';
import PackageShowcase from '../PackageShowcase.vue';
import HomeHero from './HomeHero.vue';
import HomePipeline from './HomePipeline.vue';
</script>

<template>
    <div class="hc-home-root">
        <HomeHero>
            <HomePipeline />
        </HomeHero>
        <Hero />
        <FeatureGrid />
        <CodeTabs />
        <HooksSpotlight />
        <PackageShowcase />
    </div>
</template>
