<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script lang="ts">
import type { PipelineScenario, PipelineScenarioId } from './types';

/*
 * Each scenario mirrors Client.request (packages/client/src/module.ts):
 * a 400 to 599 status leaves the track after decode into the responseError
 * hooks, a failed or timed out dispatch leaves it at fetch into the
 * requestError hooks, and the response hooks run only on success.
 */
const SCENARIOS: PipelineScenario[] = [
    {
        id: 'ok',
        label: '200 OK',
        outcome: 'Response returned, data decoded',
        exit: 'none',
        result: 'response',
    },
    {
        id: 'retry',
        label: '401, then retry',
        outcome: 'error hook returned new options, request ran again',
        exit: 'decode',
        result: 'retry',
    },
    {
        id: 'network',
        label: 'network error',
        outcome: 'no hook recovered, NetworkError thrown',
        exit: 'fetch',
        result: 'thrown',
    },
    {
        id: 'timeout',
        label: 'timeout',
        outcome: 'aborted after timeout, NetworkError with code ETIMEDOUT',
        exit: 'fetch',
        result: 'thrown',
    },
];

/** Seconds for one loop of the packet; travel takes the first 72%. */
const DURATION: Record<PipelineScenarioId, number> = {
    ok: 3,
    retry: 8,
    network: 2.2,
    timeout: 3.6,
};

/** Loops shown per scenario before auto advance moves on. */
const LOOPS = 2;
</script>

<script setup lang="ts">
import {
    computed, onBeforeUnmount, onMounted, ref,
} from 'vue';
import HomePipelineDiagram from './HomePipelineDiagram.vue';

const currentId = ref<PipelineScenarioId>('retry');
const playing = ref(true);
const autoAdvance = ref(true);

const current = computed(() => SCENARIOS.find((s) => s.id === currentId.value) as PipelineScenario);

const tone = computed(() => {
    if (current.value.result === 'thrown') {
        return 'fail';
    }

    return current.value.result === 'retry' ? 'warn' : 'ok';
});

let timer: ReturnType<typeof setTimeout> | undefined;

const stop = () => {
    clearTimeout(timer);
    timer = undefined;
};

const schedule = () => {
    stop();

    if (!playing.value || !autoAdvance.value) {
        return;
    }

    timer = setTimeout(() => {
        const index = SCENARIOS.findIndex((s) => s.id === currentId.value);
        currentId.value = SCENARIOS[(index + 1) % SCENARIOS.length].id;
        schedule();
    }, DURATION[currentId.value] * LOOPS * 1000);
};

const select = (id: PipelineScenarioId) => {
    autoAdvance.value = false;
    stop();
    currentId.value = id;
};

const toggle = () => {
    playing.value = !playing.value;
    schedule();
};

let motionQuery: MediaQueryList | null = null;

// Reduced motion can be switched on while the page is open: stop advancing
// then as well, since the pause control is hidden in that mode.
const onMotionChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
        autoAdvance.value = false;
        stop();
    }
};

onMounted(() => {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        autoAdvance.value = false;
    }
    motionQuery.addEventListener('change', onMotionChange);

    schedule();
});

onBeforeUnmount(() => {
    stop();
    motionQuery?.removeEventListener('change', onMotionChange);
});
</script>

<template>
    <div
        class="hc-pipe"
        :class="[`is-${current.id}`, `is-${tone}`, { 'is-paused': !playing }]"
        :style="{ '--hc-pipe-duration': `${DURATION[current.id]}s` }"
    >
        <div class="hc-pipe-controls">
            <div
                class="hc-pipe-chips"
                role="group"
                aria-label="Scenario"
            >
                <button
                    v-for="scenario in SCENARIOS"
                    :key="scenario.id"
                    type="button"
                    class="hc-pipe-chip"
                    :class="`is-${scenario.id}`"
                    :aria-pressed="scenario.id === current.id ? 'true' : 'false'"
                    @click="select(scenario.id)"
                >{{ scenario.label }}</button>
            </div>
            <button
                type="button"
                class="hc-pipe-toggle"
                :aria-label="playing ? 'Pause animation' : 'Play animation'"
                @click="toggle"
            >
                <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        v-if="playing"
                        d="M4 3h3v10H4zM9 3h3v10H9z"
                    />
                    <path
                        v-else
                        d="M4 2.5v11l9.5-5.5z"
                    />
                </svg>
            </button>
        </div>

        <div class="hc-pipe-figure">
            <HomePipelineDiagram
                layout="h"
                :scenario="current"
            />
            <HomePipelineDiagram
                layout="v"
                :scenario="current"
            />
        </div>

        <p
            class="hc-pipe-outcome"
            :aria-live="autoAdvance && playing ? 'off' : 'polite'"
        >
            {{ current.outcome }}
        </p>
    </div>
</template>

<style scoped>
.hc-pipe {
    --hc-pipe-ok: var(--hc-color-accent-400);
    --hc-pipe-warn: var(--hc-color-warning-500);
    --hc-pipe-fail: var(--hc-color-error-500);
    --hc-pipe-tone: var(--hc-pipe-ok);

    max-width: 980px;
    margin-top: 40px;
}

.hc-pipe.is-warn {
    --hc-pipe-tone: var(--hc-pipe-warn);
}

.hc-pipe.is-fail {
    --hc-pipe-tone: var(--hc-pipe-fail);
}

/* controls */

.hc-pipe-controls {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.hc-pipe-chips {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
}

.hc-pipe-chip,
.hc-pipe-toggle {
    border: 1px solid var(--hc-dark-border);
    border-radius: 999px;
    background: transparent;
    font-family: var(--hc-font-mono);
    font-size: 12px;
    line-height: 1.4;
    color: var(--hc-dark-fg-muted);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}

.hc-pipe-chip {
    --hc-chip-tone: var(--hc-pipe-ok);

    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
}

.hc-pipe-chip.is-retry {
    --hc-chip-tone: var(--hc-pipe-warn);
}

.hc-pipe-chip.is-network,
.hc-pipe-chip.is-timeout {
    --hc-chip-tone: var(--hc-pipe-fail);
}

.hc-pipe-chip::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--hc-chip-tone);
    opacity: 0.45;
}

.hc-pipe-chip:hover {
    border-color: var(--hc-color-primary-400);
    color: var(--hc-dark-fg);
}

.hc-pipe-chip[aria-pressed='true'] {
    border-color: var(--hc-chip-tone);
    background: color-mix(in srgb, var(--hc-chip-tone) 12%, transparent);
    color: var(--hc-chip-tone);
}

.hc-pipe-chip[aria-pressed='true']::before {
    opacity: 1;
    box-shadow: 0 0 8px var(--hc-chip-tone);
}

.hc-pipe-toggle {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
}

.hc-pipe-toggle svg {
    fill: currentColor;
}

.hc-pipe-toggle:hover {
    border-color: var(--hc-color-primary-400);
    color: var(--hc-dark-fg);
}

.hc-pipe-chip:focus-visible,
.hc-pipe-toggle:focus-visible {
    outline: 2px solid var(--hc-color-accent-400);
    outline-offset: 2px;
}

/* figure */

.hc-pipe-figure {
    margin-top: 20px;
}

/* outcome */

.hc-pipe-outcome {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 16px 0 0;
    font-family: var(--hc-font-mono);
    font-size: 13px;
    line-height: 1.5;
    color: var(--hc-dark-fg);
    overflow-wrap: anywhere;
}

.hc-pipe-outcome::before {
    content: '';
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--hc-pipe-tone);
    box-shadow: 0 0 10px var(--hc-pipe-tone);
}

/* reduced motion: the diagram stops itself, the pause button goes */

@media (prefers-reduced-motion: reduce) {
    .hc-pipe-toggle {
        display: none;
    }

    .hc-pipe-chip {
        transition: none;
    }
}
</style>
