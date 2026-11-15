/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onBeforeUnmount, ref } from 'vue';
import type { Ref } from 'vue';

/**
 * Clipboard copy with a short lived `copied` flag. The flag only turns on
 * when the write succeeded; without a clipboard API nothing happens.
 * `reset` clears the flag at once, e.g. when the copied content changes.
 */
export function useCopy(resetAfter = 1500): {
    copied: Ref<boolean>,
    copy: (text: string) => Promise<void>,
    reset: () => void,
} {
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Bumped by reset, so a write still in flight does not set the flag afterwards.
    let generation = 0;

    const reset = () => {
        generation++;
        clearTimeout(timer);
        copied.value = false;
    };

    const copy = async (text: string) => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        const current = generation;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            return;
        }

        if (current !== generation) {
            return;
        }

        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
            copied.value = false;
        }, resetAfter);
    };

    onBeforeUnmount(() => clearTimeout(timer));

    return { copied, copy, reset };
}
