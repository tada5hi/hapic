<!--
  Copyright (c) 2026.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
-->
<script lang="ts">
type ScenarioId = 'ok' | 'retry' | 'network' | 'timeout';

type Scenario = {
    id: ScenarioId,
    label: string,
    outcome: string,
    exit: 'none' | 'decode' | 'fetch',
    result: 'response' | 'retry' | 'thrown',
};

type Exit = Scenario['exit'];

type Segment = {
    d: string,
    tone: 'track' | 'warn' | 'fail',
};

type Route = {
    /** The path the packet travels. */
    packet: string,
    /** Its length in user units, to size the packet's tail. */
    length: number,
    /** The static active path, drawn brighter than the rest. */
    highlight: Segment[],
};

type Label = {
    text: string,
    x: number,
    y: number,
    anchor: 'start' | 'middle' | 'end',
    /** The scenario exit or result that lights the label. */
    lit: Exit | Scenario['result'],
};

type Layout = {
    id: 'h' | 'v',
    width: number,
    height: number,
    box: { width: number, height: number },
    boxes: { x: number, y: number }[],
    error: { x: number, y: number, width: number, height: number },
    track: { d: string, x1: number, y1: number, x2: number, y2: number },
    drops: Record<'fetch' | 'decode', string>,
    arc: string,
    labels: Label[],
    routes: Record<Exit, Route>,
};

/*
 * Each scenario mirrors Client.request (packages/client/src/module.ts):
 * a 400 to 599 status leaves the track after decode into the responseError
 * hooks, a failed or timed out dispatch leaves it at fetch into the
 * requestError hooks, and the response hooks run only on success.
 */
const SCENARIOS: Scenario[] = [
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

const STAGES = ['request', 'hooks', 'transform', 'fetch', 'decode', 'hooks', 'response'] as const;

/** Stages a packet reaches before it leaves the track at fetch. */
const STAGES_UNTIL_FETCH = 4;

/** Seconds for one loop of the packet; travel takes the first 72%. */
const DURATION: Record<ScenarioId, number> = {
    ok: 3,
    retry: 8,
    network: 2.2,
    timeout: 3.6,
};

/** Loops shown per scenario before auto advance moves on. */
const LOOPS = 2;

/** Length of the packet's tail in user units. */
const TAIL = 48;

/*
 * Geometry. Lengths are measured from the paths (the arcs by sampling the
 * cubic); keyframe fractions in the styles below depend on them.
 */
const LAYOUTS: Layout[] = [
    {
        // horizontal, 640px and wider
        id: 'h',
        width: 940,
        height: 222,
        box: { width: 112, height: 36 },
        boxes: STAGES.map((_, i) => ({ x: 138 * i, y: 50 })),
        error: {
            x: 500, y: 150, width: 216, height: 36,
        },
        track: {
            d: 'M56 68 H884', x1: 56, y1: 68, x2: 884, y2: 68,
        },
        drops: {
            fetch: 'M539 68 V150',
            decode: 'M677 68 V150',
        },
        arc: 'M500 168 C260 168 56 204 56 90',
        labels: [
            {
                text: 'NetworkError', x: 531, y: 118, anchor: 'end', lit: 'fetch',
            },
            {
                text: 'HttpResponseError', x: 685, y: 118, anchor: 'start', lit: 'decode',
            },
            {
                text: 'new options', x: 240, y: 198, anchor: 'middle', lit: 'retry',
            },
        ],
        routes: {
            none: {
                packet: 'M56 68 H884',
                length: 828,
                highlight: [{ d: 'M56 68 H884', tone: 'track' }],
            },
            decode: {
                packet: 'M56 68 H677 V168 H500 C260 168 56 204 56 86 V68 H884',
                length: 2232,
                highlight: [
                    { d: 'M56 68 H884', tone: 'track' },
                    { d: 'M677 68 V150', tone: 'warn' },
                ],
            },
            fetch: {
                packet: 'M56 68 H539 V168',
                length: 583,
                highlight: [
                    { d: 'M56 68 H539', tone: 'track' },
                    { d: 'M539 68 V150', tone: 'fail' },
                ],
            },
        },
    },
    {
        // vertical stack, below 640px
        id: 'v',
        width: 320,
        height: 396,
        box: { width: 160, height: 36 },
        boxes: STAGES.map((_, i) => ({ x: 24, y: 12 + 56 * i })),
        error: {
            x: 204, y: 208, width: 108, height: 36,
        },
        track: {
            d: 'M104 30 V366', x1: 104, y1: 30, x2: 104, y2: 366,
        },
        drops: {
            fetch: 'M104 226 H204',
            decode: 'M104 282 H258 V244',
        },
        arc: 'M258 208 C258 120 258 30 188 30',
        labels: [],
        routes: {
            none: {
                packet: 'M104 30 V366',
                length: 336,
                highlight: [{ d: 'M104 30 V366', tone: 'track' }],
            },
            decode: {
                packet: 'M104 30 V282 H258 V208 C258 120 258 30 184 30 H104 V366',
                length: 1112,
                highlight: [
                    { d: 'M104 30 V366', tone: 'track' },
                    { d: 'M104 282 H258 V244', tone: 'warn' },
                ],
            },
            fetch: {
                packet: 'M104 30 V226 H214',
                length: 306,
                highlight: [
                    { d: 'M104 30 V226', tone: 'track' },
                    { d: 'M104 226 H204', tone: 'fail' },
                ],
            },
        },
    },
];
</script>

<script setup lang="ts">
import {
    computed, onBeforeUnmount, onMounted, ref,
} from 'vue';

const currentId = ref<ScenarioId>('retry');
const playing = ref(true);
const autoAdvance = ref(true);

const current = computed(() => SCENARIOS.find((s) => s.id === currentId.value) as Scenario);

const reach = computed(() => (current.value.exit === 'fetch' ? STAGES_UNTIL_FETCH : STAGES.length));

const tone = computed(() => {
    if (current.value.result === 'thrown') {
        return 'fail';
    }

    return current.value.result === 'retry' ? 'warn' : 'ok';
});

const tail = (route: Route) => `0 200 ${(TAIL / route.length * 100).toFixed(2)} 0`;

const isLabelLit = (label: Label) => label.lit === current.value.exit || label.lit === current.value.result;

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

const select = (id: ScenarioId) => {
    autoAdvance.value = false;
    stop();
    currentId.value = id;
};

const toggle = () => {
    playing.value = !playing.value;
    schedule();
};

onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        autoAdvance.value = false;
    }

    schedule();
});

onBeforeUnmount(stop);
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
            <svg
                v-for="layout in LAYOUTS"
                :key="layout.id"
                class="hc-pipe-svg"
                :class="`hc-pipe-svg--${layout.id}`"
                :viewBox="`0 0 ${layout.width} ${layout.height}`"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <linearGradient
                        :id="`hc-pipe-${layout.id}-track`"
                        gradientUnits="userSpaceOnUse"
                        :x1="layout.track.x1"
                        :y1="layout.track.y1"
                        :x2="layout.track.x2"
                        :y2="layout.track.y2"
                    >
                        <stop stop-color="#818cf8" />
                        <stop
                            offset="1"
                            stop-color="#22d3ee"
                        />
                    </linearGradient>
                    <filter
                        :id="`hc-pipe-${layout.id}-glow`"
                        filterUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        :width="layout.width"
                        :height="layout.height"
                    >
                        <feGaussianBlur
                            stdDeviation="4"
                            result="blur"
                        />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <marker
                        :id="`hc-pipe-${layout.id}-head`"
                        viewBox="0 0 10 10"
                        refX="7"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path
                            d="M0 0 L10 5 L0 10 Z"
                            fill="#f59e0b"
                        />
                    </marker>
                </defs>

                <path
                    class="hc-pipe-rail"
                    :d="layout.track.d"
                    :stroke="`url(#hc-pipe-${layout.id}-track)`"
                />
                <path
                    class="hc-pipe-drop"
                    :d="layout.drops.fetch"
                />
                <path
                    class="hc-pipe-drop"
                    :d="layout.drops.decode"
                />
                <path
                    class="hc-pipe-arc hc-pipe-anim"
                    :d="layout.arc"
                    :marker-end="`url(#hc-pipe-${layout.id}-head)`"
                />

                <path
                    v-for="segment in layout.routes[current.exit].highlight"
                    :key="segment.d"
                    class="hc-pipe-line"
                    :class="`is-${segment.tone}`"
                    :d="segment.d"
                    :stroke="segment.tone === 'track' ? `url(#hc-pipe-${layout.id}-track)` : undefined"
                    :filter="`url(#hc-pipe-${layout.id}-glow)`"
                />

                <g
                    v-for="(box, index) in layout.boxes"
                    :key="index"
                    class="hc-pipe-box"
                    :class="{ 'is-off': index >= reach }"
                >
                    <rect
                        :x="box.x"
                        :y="box.y"
                        :width="layout.box.width"
                        :height="layout.box.height"
                        rx="8"
                    />
                    <text
                        :x="box.x + layout.box.width / 2"
                        :y="box.y + layout.box.height / 2"
                    >{{ STAGES[index] }}</text>
                </g>

                <g class="hc-pipe-error">
                    <rect
                        :x="layout.error.x"
                        :y="layout.error.y"
                        :width="layout.error.width"
                        :height="layout.error.height"
                        rx="8"
                    />
                    <text
                        :x="layout.error.x + layout.error.width / 2"
                        :y="layout.error.y + layout.error.height / 2"
                    >error hooks</text>
                </g>

                <text
                    v-for="label in layout.labels"
                    :key="label.text"
                    class="hc-pipe-label"
                    :class="{ 'is-lit': isLabelLit(label) }"
                    :x="label.x"
                    :y="label.y"
                    :text-anchor="label.anchor"
                >{{ label.text }}</text>

                <g
                    :key="current.id"
                    class="hc-pipe-motion"
                >
                    <rect
                        v-if="current.result === 'thrown'"
                        class="hc-pipe-halo hc-pipe-anim"
                        :x="layout.error.x"
                        :y="layout.error.y"
                        :width="layout.error.width"
                        :height="layout.error.height"
                        rx="8"
                        :filter="`url(#hc-pipe-${layout.id}-glow)`"
                    />
                    <rect
                        v-else
                        class="hc-pipe-halo hc-pipe-anim"
                        :x="layout.boxes[STAGES.length - 1].x"
                        :y="layout.boxes[STAGES.length - 1].y"
                        :width="layout.box.width"
                        :height="layout.box.height"
                        rx="8"
                        :filter="`url(#hc-pipe-${layout.id}-glow)`"
                    />
                    <path
                        class="hc-pipe-packet hc-pipe-tail hc-pipe-anim"
                        :d="layout.routes[current.exit].packet"
                        pathLength="100"
                        :stroke-dasharray="tail(layout.routes[current.exit])"
                    />
                    <path
                        class="hc-pipe-packet hc-pipe-head hc-pipe-anim"
                        :d="layout.routes[current.exit].packet"
                        pathLength="100"
                        :filter="`url(#hc-pipe-${layout.id}-glow)`"
                    />
                </g>
            </svg>
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

.hc-pipe-svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
}

.hc-pipe-svg--v {
    display: none;
    max-width: 360px;
}

@media (max-width: 639px) {
    .hc-pipe-svg--h {
        display: none;
    }

    .hc-pipe-svg--v {
        display: block;
    }
}

.hc-pipe-rail {
    fill: none;
    stroke-width: 2;
    opacity: 0.22;
}

.hc-pipe-drop {
    fill: none;
    stroke: var(--hc-dark-border);
    stroke-width: 1.5;
    stroke-dasharray: 3 4;
}

.hc-pipe-arc {
    fill: none;
    stroke: var(--hc-pipe-warn);
    stroke-width: 1.5;
    stroke-dasharray: 6 6;
    opacity: 0.22;
    transition: opacity 0.3s;
}

.is-retry .hc-pipe-arc {
    stroke-width: 2;
    opacity: 1;
    animation: hc-pipe-march 0.9s linear infinite;
}

.hc-pipe-line {
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
}

.hc-pipe-line.is-warn {
    stroke: var(--hc-pipe-warn);
}

.hc-pipe-line.is-fail {
    stroke: var(--hc-pipe-fail);
}

.hc-pipe-box rect,
.hc-pipe-error rect {
    fill: var(--hc-dark-bg-elevated);
    stroke: rgba(129, 140, 248, 0.55);
    stroke-width: 1.25;
    transition: stroke 0.3s;
}

.hc-pipe-box text,
.hc-pipe-error text,
.hc-pipe-label {
    font-family: var(--hc-font-mono);
    font-weight: 600;
    fill: var(--hc-dark-fg);
    dominant-baseline: central;
    text-anchor: middle;
}

.hc-pipe-box text {
    font-size: 15px;
}

.hc-pipe-error text {
    font-size: 14px;
}

.hc-pipe-svg--v .hc-pipe-error text {
    font-size: 13px;
}

.hc-pipe-box,
.hc-pipe-error {
    transition: opacity 0.3s;
}

.hc-pipe-box.is-off,
.is-ok .hc-pipe-error {
    opacity: 0.38;
}

.is-ok .hc-pipe-error rect {
    stroke: var(--hc-dark-border);
}

.is-warn .hc-pipe-error rect {
    stroke: var(--hc-pipe-warn);
}

.is-warn .hc-pipe-error text {
    fill: var(--hc-pipe-warn);
}

.hc-pipe-label {
    font-size: 12px;
    font-weight: 500;
    fill: var(--hc-dark-fg-muted);
    opacity: 0.45;
    transition: opacity 0.3s;
}

.hc-pipe-label.is-lit {
    fill: var(--hc-pipe-tone);
    opacity: 1;
}

/* motion */

.hc-pipe-halo {
    fill: color-mix(in srgb, var(--hc-pipe-tone) 14%, transparent);
    stroke: var(--hc-pipe-tone);
    stroke-width: 2;
    opacity: 0;
    animation: hc-pipe-arrive var(--hc-pipe-duration) linear infinite;
}

.hc-pipe.is-warn .hc-pipe-halo {
    --hc-pipe-tone: var(--hc-pipe-ok);
}

.hc-pipe-packet {
    --hc-pipe-packet: var(--hc-pipe-ok);

    fill: none;
    stroke: var(--hc-pipe-packet);
    stroke-linecap: round;
    animation-name: hc-pipe-travel;
    animation-duration: var(--hc-pipe-duration);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}

.hc-pipe-head {
    --hc-pipe-packet: #cffafe;

    stroke-width: 10;
    stroke-dasharray: 0.001 200;
}

.hc-pipe-tail {
    stroke-width: 3;
    stroke-opacity: 0.45;
}

.is-timeout .hc-pipe-svg--h .hc-pipe-packet {
    animation-name: hc-pipe-stall-h, hc-pipe-tint-fail;
}

.is-timeout .hc-pipe-svg--v .hc-pipe-packet {
    animation-name: hc-pipe-stall-v, hc-pipe-tint-fail;
}

.is-network .hc-pipe-packet {
    animation-name: hc-pipe-travel, hc-pipe-tint-fail;
}

.is-retry .hc-pipe-svg--h .hc-pipe-packet {
    animation-name: hc-pipe-travel, hc-pipe-tint-retry-h;
}

.is-retry .hc-pipe-svg--v .hc-pipe-packet {
    animation-name: hc-pipe-travel, hc-pipe-tint-retry-v;
}

.is-paused .hc-pipe-anim {
    animation-play-state: paused;
}

/*
 * Every loop: travel during the first 72%, show the end state, fade out.
 * The packet paths use pathLength="100", so offsets are percentages.
 */
@keyframes hc-pipe-travel {
    0% {
        stroke-dashoffset: 0;
        opacity: 0;
    }

    4% {
        opacity: 1;
    }

    72% {
        stroke-dashoffset: -100;
    }

    90% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: -100;
        opacity: 0;
    }
}

/* timeout: the packet waits at fetch (71% of the path, 55% stacked) until the timer fires */
@keyframes hc-pipe-stall-h {
    0% {
        stroke-dashoffset: 0;
        opacity: 0;
    }

    4% {
        opacity: 1;
    }

    30%,
    56% {
        stroke-dashoffset: -71;
    }

    72% {
        stroke-dashoffset: -100;
    }

    90% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: -100;
        opacity: 0;
    }
}

@keyframes hc-pipe-stall-v {
    0% {
        stroke-dashoffset: 0;
        opacity: 0;
    }

    4% {
        opacity: 1;
    }

    30%,
    56% {
        stroke-dashoffset: -55;
    }

    72% {
        stroke-dashoffset: -100;
    }

    90% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: -100;
        opacity: 0;
    }
}

@keyframes hc-pipe-tint-fail {
    0%,
    66% {
        stroke: var(--hc-pipe-packet);
    }

    72%,
    100% {
        stroke: var(--hc-pipe-fail);
    }
}

/* retry: amber from the drop after decode until the arc reaches request (28% to 63% of the path) */
@keyframes hc-pipe-tint-retry-h {
    0%,
    19% {
        stroke: var(--hc-pipe-packet);
    }

    21%,
    44% {
        stroke: var(--hc-pipe-warn);
    }

    46%,
    100% {
        stroke: var(--hc-pipe-packet);
    }
}

/* stacked: 23% to 70% of the path */
@keyframes hc-pipe-tint-retry-v {
    0%,
    15% {
        stroke: var(--hc-pipe-packet);
    }

    17%,
    49% {
        stroke: var(--hc-pipe-warn);
    }

    51%,
    100% {
        stroke: var(--hc-pipe-packet);
    }
}

@keyframes hc-pipe-arrive {
    0%,
    70% {
        opacity: 0;
    }

    74%,
    90% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes hc-pipe-march {
    to {
        stroke-dashoffset: -12;
    }
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

/* reduced motion: nothing moves, the active path stays highlighted */

@media (prefers-reduced-motion: reduce) {
    .hc-pipe-anim {
        animation: none !important;
    }

    .hc-pipe-packet,
    .hc-pipe-toggle {
        display: none;
    }

    .hc-pipe-halo {
        opacity: 1;
    }

    .hc-pipe-chip,
    .hc-pipe-arc,
    .hc-pipe-box,
    .hc-pipe-error,
    .hc-pipe-label,
    .hc-pipe-box rect,
    .hc-pipe-error rect {
        transition: none;
    }
}
</style>
