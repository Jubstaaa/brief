import {
    afterEach,
    beforeEach,
    describe,
    expect,
    type Mock,
    mock,
    spyOn,
    test,
} from 'bun:test'

import type { Brief } from '@/lib/brief'

import { publishBrief } from './publish'

function week(label: string): Brief {
    return {
        commits: [],
        counts: [{ kept: 1, label: 'react', total: 4 }],
        generatedAt: `${label}T07:00:00.000Z`,
        items: [
            {
                action: 'a',
                code: null,
                detail: 'd',
                headline: 'h',
                kind: 'fix',
                pr: 1,
                repo: 'react',
            },
        ],
        model: 'm',
        quiet: false,
        releases: [],
        since: '2026-11-10T06:00:00.000Z',
        until: `${label}T06:00:00.000Z`,
        usage: { calls: 1, inputTokens: 1, outputTokens: 1 },
        week: label,
    }
}

const bucket = new Map<string, string>()
const savedEnv = {
    SPACES_KEY: process.env.SPACES_KEY,
    SPACES_SECRET: process.env.SPACES_SECRET,
}

beforeEach(() => {
    bucket.clear()
    process.env.SPACES_KEY = 'key'
    process.env.SPACES_SECRET = 'secret'

    // spyOn types a class constructor as `never`; the fake only needs the
    // three methods publishBrief calls.
    const S3Client = spyOn(Bun, 'S3Client') as unknown as Mock<() => unknown>
    S3Client.mockImplementation(() => ({
        file: (key: string) => ({
            text: async () => bucket.get(key) ?? '',
        }),
        list: async ({ prefix }: { prefix: string }) => ({
            contents: [...bucket.keys()]
                .filter(key => key.startsWith(prefix))
                .map(key => ({ key })),
        }),
        write: async (key: string, body: string) => {
            bucket.set(key, body)
        },
    }))
})

afterEach(() => {
    mock.restore()
    for (const [name, value] of Object.entries(savedEnv)) {
        if (value === undefined) delete process.env[name]
        else process.env[name] = value
    }
})

describe('publishBrief', () => {
    test('writes the week and rebuilds the index newest first', async () => {
        bucket.set('weeks/2026-11-10.json', JSON.stringify(week('2026-11-10')))

        await publishBrief(week('2026-11-17'))

        const index = JSON.parse(bucket.get('index.json') ?? '[]') as {
            week: string
        }[]
        expect(index.map(entry => entry.week)).toEqual([
            '2026-11-17',
            '2026-11-10',
        ])
    })

    test('refuses to rebuild the index from a corrupt week', async () => {
        bucket.set(
            'weeks/2026-11-10.json',
            JSON.stringify({ ...week('2026-11-10'), week: 'last week' })
        )

        await expect(publishBrief(week('2026-11-17'))).rejects.toThrow(
            'weeks/2026-11-10.json'
        )
        expect(bucket.has('weeks/2026-11-17.json')).toBe(false)
        expect(bucket.has('index.json')).toBe(false)
    })

    test('refuses to publish a brief the site would reject', async () => {
        const brief = week('2026-11-17')
        brief.releases = [
            {
                label: 'react',
                publishedAt: '2026-11-12T18:00:00Z',
                tag: 'v19.3.0',
                url: 'http://example.test/v19.3.0',
            },
        ]

        await expect(publishBrief(brief)).rejects.toThrow(
            'weeks/2026-11-17.json'
        )
        expect(bucket.size).toBe(0)
    })

    test('names the key of a stored week that is not valid JSON', async () => {
        bucket.set('weeks/2026-11-10.json', '{"week":')

        await expect(publishBrief(week('2026-11-17'))).rejects.toThrow(
            'weeks/2026-11-10.json'
        )
    })
})
