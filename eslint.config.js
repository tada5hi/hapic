/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import config from '@tada5hi/eslint-config';

export default [
    ...await config({ typescript: true, vue: false }),
    {
        rules: {
            'class-methods-use-this': 'off',
            'dot-notation': 'off',
            'no-continue': 'off',
            'no-use-before-define': 'off',
            'no-shadow': 'off',
            'no-unused-vars': 'off',

            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-shadow': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        ignores: [
            '**/dist/**',
            '**/*.d.ts',
            '**/coverage/**',
            '**/writable/**',
            'packages/docs/**',
        ],
    },
];
