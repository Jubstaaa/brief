import { describe, expect, test } from 'bun:test'

import type { Brief, BriefItem } from '@/lib/brief'

import { toEntry } from './entry'

function item(repo: string, pr: number): BriefItem {
    return { action: '', detail: '', headline: '', kind: 'fix', pr, repo }
}

const brief: Brief = {
    commits: [],
    counts: [
        { kept: 3, label: 'react', total: 10 },
        { kept: 1, label: 'expo', total: 5 },
    ],
    generatedAt: '2026-07-28T07:00:00.000Z',
    items: [item('react', 1), item('react', 2), item('expo', 3)],
    model: 'm',
    quiet: false,
    releases: [],
    since: '2026-07-21T06:00:00.000Z',
    until: '2026-07-28T06:00:00.000Z',
    usage: { calls: 0, inputTokens: 0, outputTokens: 0 },
    week: '2026-07-28',
}

describe('toEntry', () => {
    test('counts items per framework and skips frameworks with none', () => {
        expect(toEntry(brief)).toEqual({
            frameworks: [
                { itemCount: 2, slug: 'react' },
                { itemCount: 1, slug: 'expo' },
            ],
            itemCount: 3,
            since: brief.since,
            total: 15,
            until: brief.until,
            week: '2026-07-28',
        })
    })
})
