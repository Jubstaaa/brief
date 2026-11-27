import { beforeEach, describe, expect, mock, test } from 'bun:test'

import type { RepoCommits } from '@/pipeline/github/commits'

const fetchPullDetail = mock()

const pulls = await import('@/pipeline/github/pulls')
await mock.module('@/pipeline/github/pulls', () => ({
    ...pulls,
    fetchPullDetail,
}))

const { enrich } = await import('./enrich')

const repos: RepoCommits[] = [
    {
        dropped: 0,
        kept: [1, 2].map(pr => ({
            prNumber: pr,
            sha: String(pr),
            title: `PR (#${pr})`,
            url: `https://github.com/facebook/react/commit/${pr}`,
        })),
        label: 'react',
        total: 2,
    },
]

beforeEach(() => {
    fetchPullDetail.mockReset()
    fetchPullDetail.mockImplementation(async (_config, pr: number) => ({
        number: pr,
    }))
})

describe('enrich', () => {
    test('fetches each picked pull request once', async () => {
        const details = await enrich(
            {
                picks: [
                    { kind: 'fix', pr: 1, reason: 'r', repo: 'react' },
                    { kind: 'feature', pr: 1, reason: 'r', repo: 'react' },
                ],
            },
            repos
        )

        expect(details.map(detail => detail.number)).toEqual([1])
        expect(fetchPullDetail).toHaveBeenCalledTimes(1)
    })

    test('skips unknown repos and pull requests outside the window', async () => {
        const details = await enrich(
            {
                picks: [
                    { kind: 'fix', pr: 1, reason: 'r', repo: 'vue' },
                    { kind: 'fix', pr: 99, reason: 'r', repo: 'react' },
                    { kind: 'fix', pr: 2, reason: 'r', repo: 'react' },
                ],
            },
            repos
        )

        expect(details.map(detail => detail.number)).toEqual([2])
    })

    test('skips a pull request that cannot be fetched', async () => {
        fetchPullDetail.mockRejectedValueOnce(new Error('404'))

        const details = await enrich(
            {
                picks: [
                    { kind: 'fix', pr: 1, reason: 'r', repo: 'react' },
                    { kind: 'fix', pr: 2, reason: 'r', repo: 'react' },
                ],
            },
            repos
        )

        expect(details.map(detail => detail.number)).toEqual([2])
    })

    test('throws when none of the picked pull requests could be fetched', async () => {
        fetchPullDetail.mockRejectedValue(new Error('503'))

        await expect(
            enrich(
                {
                    picks: [
                        { kind: 'fix', pr: 1, reason: 'r', repo: 'react' },
                        { kind: 'fix', pr: 2, reason: 'r', repo: 'react' },
                    ],
                },
                repos
            )
        ).rejects.toThrow('could not fetch any of the 2 picked pull requests')
    })

    test('returns nothing for a week without picks', async () => {
        expect(await enrich({ picks: [] }, repos)).toEqual([])
    })
})
