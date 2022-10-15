/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^axios$': require.resolve('axios'),
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    testRegex: '(/unit/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    testPathIgnorePatterns: [
        'writable',
        'dist',
        '/unit/mock-util.ts',
    ],
    coverageDirectory: 'writable/coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/**/*.d.ts',
        '!src/decorator/functions.ts',
        '!src/decorator/mapper/maps/**/*.{ts,js,json,yml}',
        '!src/decorator/utils/validator.ts',
        // the resolver actually uses exclusive typescript functions
        // and to debug them, we need to rebuild the compiler ^^.
        '!src/resolver/**/*.ts',
        '!src/utils/validator.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 58,
            functions: 77,
            lines: 73,
            statements: 73,
        },
    },
    rootDir: '../',
    verbose: true,
};
