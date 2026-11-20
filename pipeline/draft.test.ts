import { beforeEach, describe, expect, mock, test } from 'bun:test'

import type { PullDetail } from '@/pipeline/github/pulls'
import { MAX_CODE_BLOCKS } from '@/pipeline/inference/config'

import type { TriagePick } from './triage.schema'

const complete = mock()

// mock.module replaces the module for every importer in the run, so keep its
// other exports.
const client = await import('@/pipeline/inference/client')
mock.module('@/pipeline/inference/client', () => ({ ...client, complete }))

const { draft } = await import('./draft')

function pick(pr: number): TriagePick {
    return { kind: 'feature', pr, reason: 'relevant', repo: 'react' }
}

function detail(pr: number): PullDetail {
    return {
        body: '',
        files: [],
        label: 'react',
        labels: [],
        number: pr,
        title: `PR ${pr}`,
        url: `https://github.com/facebook/react/pull/${pr}`,
    }
}

const written = {
    action: 'a',
    code: { lang: 'ts', snippet: 'x' },
    detail: 'd',
    headline: 'h',
}

beforeEach(() => {
    complete.mockReset()
})

describe('draft', () => {
    test('throws instead of publishing an empty brief when every draft fails', async () => {
        complete.mockRejectedValue(new Error('500'))

        await expect(
            draft({ picks: [pick(1), pick(2)] }, [detail(1), detail(2)])
        ).rejects.toThrow('drafting failed for all 2 picks')
    })

    test('skips a failed draft and keeps the rest', async () => {
        complete
            .mockRejectedValueOnce(new Error('500'))
            .mockResolvedValueOnce(written)

        const items = await draft({ picks: [pick(1), pick(2)] }, [
            detail(1),
            detail(2),
        ])

        expect(items.map(item => item.pr)).toEqual([2])
    })

    test('skips picks without pull request detail', async () => {
        complete.mockResolvedValue(written)

        const items = await draft({ picks: [pick(1), pick(2)] }, [detail(2)])

        expect(items.map(item => item.pr)).toEqual([2])
    })

    test('keeps at most MAX_CODE_BLOCKS code samples per repo', async () => {
        complete.mockResolvedValue(written)
        const prs = Array.from({ length: MAX_CODE_BLOCKS + 2 }, (_, i) => i + 1)

        const items = await draft({ picks: prs.map(pick) }, prs.map(detail))

        expect(items.filter(item => item.code).length).toBe(MAX_CODE_BLOCKS)
    })
})
