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
 */
export function useCopy(resetAfter = 1500): { copied: Ref<boolean>, copy: (text: string) => Promise<void> } {
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const copy = async (text: string) => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            return;
        }

        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
            copied.value = false;
        }, resetAfter);
    };

    onBeforeUnmount(() => clearTimeout(timer));

    return { copied, copy };
}
