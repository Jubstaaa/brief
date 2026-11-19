import { describe, expect, test } from 'bun:test'

import type { ArchiveEntry } from './brief'
import { buildFrameworkFeed, buildSiteFeed } from './feed'
import { findRepoBySlug } from './repos'
import { SITE_URL } from './site'

const entries: ArchiveEntry[] = [
    {
        frameworks: [
            { itemCount: 4, slug: 'react' },
            { itemCount: 2, slug: 'expo' },
        ],
        itemCount: 6,
        since: '2026-11-10T06:00:00.000Z',
        total: 90,
        until: '2026-11-17T06:00:00.000Z',
        week: '2026-11-17',
    },
]

function links(xml: string): string[] {
    return [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map(match => match[1]!)
}

describe('feeds', () => {
    test('site feed links every page by its canonical URL', () => {
        expect(links(buildSiteFeed(entries))).toEqual([
            `${SITE_URL}/`,
            `${SITE_URL}/react/2026-11-17/`,
            `${SITE_URL}/expo/2026-11-17/`,
        ])
    })

    test('framework feed links the archive and its weeks canonically', () => {
        const react = findRepoBySlug('react')!
        const xml = buildFrameworkFeed(react, entries)

        expect(links(xml)).toEqual([
            `${SITE_URL}/react/`,
            `${SITE_URL}/react/2026-11-17/`,
        ])
        expect(xml).toContain('<description><![CDATA[4 madde]]></description>')
    })
})
