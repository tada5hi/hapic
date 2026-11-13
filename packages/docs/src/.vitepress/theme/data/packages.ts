/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type PackageCard = { name: string, summary: string, accent: string, order: number, link: string };

function fail(url: string, key: string, problem: string): never {
    throw new Error(`packages frontmatter: ${url}: "package.${key}" ${problem}`);
}

/**
 * Build a landing page package card from the `package` frontmatter of a
 * package page. Throws when a field is missing or has the wrong type, so a
 * broken page fails the build instead of rendering an empty card.
 */
export function buildPackageCard(url: string, frontmatter: Record<string, unknown>): PackageCard {
    const input = frontmatter.package;
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new Error(`packages frontmatter: ${url}: "package" must be an object`);
    }

    const record = input as Record<string, unknown>;
    const text = (key: 'name' | 'summary' | 'accent'): string => {
        const value = record[key];
        if (typeof value !== 'string' || value.trim().length === 0) {
            fail(url, key, 'must be a non empty string');
        }

        return value;
    };

    const { order } = record;
    if (typeof order !== 'number' || !Number.isFinite(order)) {
        fail(url, 'order', 'must be a finite number');
    }

    return {
        name: text('name'),
        summary: text('summary'),
        accent: text('accent'),
        order,
        link: url,
    };
}
