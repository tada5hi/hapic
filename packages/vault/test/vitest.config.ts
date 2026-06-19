/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['test/unit/**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx,js,jsx}'],
            exclude: [
                '**/*.d.ts',
                'src/index.ts',
                'src/http/index.ts',
                'src/http/error/index.ts',
                'src/http/header/index.ts',
                'src/protocols/oauth2/client/error/*.ts',
                'src/utils/index.ts',
            ],
            thresholds: {
                branches: 59,
                functions: 77,
                lines: 73,
                statements: 74,
            },
        },
    },
});
