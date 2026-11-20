import { describe, expect, mock, test } from 'bun:test'

import { findRepo } from '@/lib/repos'

const paginate = mock()

// mock.module replaces the module for every importer in the run, so keep the
// real octokit and override only the call this test drives.
const client = await import('./client')
mock.module('./client', () => ({
    ...client,
    octokit: { ...client.octokit, paginate },
}))

const { fetchReleases } = await import('./releases')

function release(
    tag: string,
    publishedAt: string | null,
    flags: { draft?: boolean; prerelease?: boolean } = {}
) {
    return {
        draft: flags.draft ?? false,
        html_url: `https://github.com/facebook/react/releases/tag/${tag}`,
        prerelease: flags.prerelease ?? false,
        published_at: publishedAt,
        tag_name: tag,
    }
}

describe('fetchReleases', () => {
    test('keeps stable releases published inside the window', async () => {
        paginate.mockResolvedValue([
            release('v19.2.10', '2026-11-10T06:00:00.000Z'),
            release('v19.3.0', '2026-11-12T18:00:00Z'),
            release('v19.3.1', '2026-11-17T06:00:00Z'),
            release('v19.2.9', '2026-11-09T18:00:00Z'),
            release('v19.4.0-rc.0', '2026-11-12T18:00:00Z'),
            release('v19.4.0', '2026-11-12T18:00:00Z', { prerelease: true }),
            release('v19.5.0', '2026-11-12T18:00:00Z', { draft: true }),
            release('v19.6.0', null),
        ])

        const config = findRepo('react')
        if (!config) throw new Error('react is not configured')

        expect(
            await fetchReleases(
                config,
                '2026-11-10T06:00:00.000Z',
                '2026-11-17T06:00:00.000Z'
            )
        ).toEqual([
            {
                label: 'react',
                publishedAt: '2026-11-10T06:00:00.000Z',
                tag: 'v19.2.10',
                url: 'https://github.com/facebook/react/releases/tag/v19.2.10',
            },
            {
                label: 'react',
                publishedAt: '2026-11-12T18:00:00Z',
                tag: 'v19.3.0',
                url: 'https://github.com/facebook/react/releases/tag/v19.3.0',
            },
        ])
    })
})
