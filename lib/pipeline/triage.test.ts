import { describe, expect, mock, test } from 'bun:test'

import type { Commit, RepoCommits } from '../types/brief.types'

const complete = mock()

mock.module('../inference/client', () => ({ complete }))

const { triage } = await import('./triage')

function repo(label: string, titles: string[]): RepoCommits {
    const kept: Commit[] = titles.map(title => ({
        prNumber: 1,
        sha: title,
        title,
        url: `https://example.test/${title}`,
    }))

    return { dropped: 0, kept, label, total: kept.length }
}

describe('triage', () => {
    test('throws instead of returning empty when every call fails', async () => {
        complete.mockRejectedValue(new Error('403 status code (no body)'))

        await expect(
            triage([repo('react', ['a']), repo('expo', ['b'])])
        ).rejects.toThrow('triage failed for 2 of 2 repos')
    })

    test('keeps going when one repo fails but another picks', async () => {
        complete
            .mockRejectedValueOnce(new Error('403 status code (no body)'))
            .mockResolvedValueOnce({
                picks: [{ kind: 'fix', pr: 1, reason: 'relevant' }],
            })

        const result = await triage([repo('react', ['a']), repo('expo', ['b'])])

        expect(result.picks).toEqual([
            { kind: 'fix', pr: 1, reason: 'relevant', repo: 'expo' },
        ])
    })

    test('returns no picks for a genuinely quiet window', async () => {
        const result = await triage([repo('react', []), repo('expo', [])])

        expect(result.picks).toHaveLength(0)
    })
})
