import {
    afterEach,
    beforeEach,
    describe,
    expect,
    mock,
    spyOn,
    test,
} from 'bun:test'
import { consola } from 'consola'
import type { z } from 'zod'

import { briefSchema } from '@/lib/brief'
import type { PullDetail } from '@/pipeline/github/pulls'
import { MAX_CODE_BLOCKS } from '@/pipeline/inference/config'

import type { TriagePick } from './triage.schema'

const complete = mock()

// mock.module replaces the module for every importer in the run, so keep its
// other exports.
const client = await import('@/pipeline/inference/client')
mock.module('@/pipeline/inference/client', () => ({ ...client, complete }))

const { draft } = await import('./draft')

function pick(pr: number, repo = 'react'): TriagePick {
    return { kind: 'feature', pr, reason: 'relevant', repo }
}

function detail(pr: number, label = 'react'): PullDetail {
    return {
        body: '',
        files: [],
        label,
        labels: [],
        number: pr,
        title: `${label} PR ${pr}`,
        url: `https://github.com/example/${label}/pull/${pr}`,
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

afterEach(() => {
    mock.restore()
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

    test('drafts each pick from its own repo when two repos share a PR number', async () => {
        complete.mockResolvedValue(written)

        await draft({ picks: [pick(7, 'expo')] }, [
            detail(7, 'expo'),
            detail(7, 'react'),
        ])

        const prompt = String(complete.mock.calls[0]?.[0]?.user)
        expect(prompt).toContain('expo PR 7')
        expect(prompt).not.toContain('react PR 7')
    })

    test('keeps the item but drops a code sample the site could not render', async () => {
        // complete() parses the model's JSON with the schema it is given.
        complete.mockImplementation(async ({ schema }: { schema: z.ZodType }) =>
            schema.parse({
                ...written,
                code: { lang: 'shell session', snippet: 'x' },
            })
        )

        const silent = Object.assign(() => {}, { raw: () => {} })
        const warn = spyOn(consola, 'warn').mockImplementation(silent)

        const items = await draft({ picks: [pick(1)] }, [detail(1)])

        expect(items).toHaveLength(1)
        expect(items[0]?.code).toBeNull()
        expect(briefSchema.shape.items.safeParse(items).success).toBe(true)
        expect(String(warn.mock.calls[0]?.[0])).toContain(
            'react#1: code language "shell session"'
        )
    })

    test('keeps at most MAX_CODE_BLOCKS code samples per repo', async () => {
        complete.mockResolvedValue(written)
        const prs = Array.from({ length: MAX_CODE_BLOCKS + 2 }, (_, i) => i + 1)

        const items = await draft(
            { picks: prs.map(pr => pick(pr)) },
            prs.map(pr => detail(pr))
        )

        expect(items.filter(item => item.code).length).toBe(MAX_CODE_BLOCKS)
    })
})
