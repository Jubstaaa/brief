import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'

import { readArchive, readBrief, readWeekParams } from './archive'

const entry = {
    frameworks: [
        { itemCount: 2, slug: 'react' },
        { itemCount: 1, slug: 'expo' },
    ],
    itemCount: 3,
    since: '2026-11-10T06:00:00.000Z',
    total: 40,
    until: '2026-11-17T06:00:00.000Z',
    week: '2026-11-17',
}

const brief = {
    commits: [
        {
            repo: 'react',
            title: 'Fix a thing (#1)',
            url: 'https://github.com/react/react/commit/abc',
        },
    ],
    counts: [{ kept: 1, label: 'react', total: 2 }],
    generatedAt: '2026-11-17T07:54:12.075Z',
    items: [
        {
            action: 'Bir şey yapmak gerekmiyor',
            code: null,
            detail: 'detail',
            headline: 'headline',
            kind: 'fix' as const,
            pr: 1,
            repo: 'react',
        },
    ],
    model: 'triage + draft',
    quiet: false,
    releases: [
        {
            label: 'react',
            publishedAt: '2026-11-12T18:00:00Z',
            tag: 'v19.3.0',
            url: 'https://github.com/react/react/releases/tag/v19.3.0',
        },
    ],
    since: '2026-11-10T06:00:00.000Z',
    until: '2026-11-17T06:00:00.000Z',
    usage: { calls: 3, inputTokens: 10, outputTokens: 5 },
    week: '2026-11-17',
}

function respondWith(body: unknown, status = 200) {
    return spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(body), { status })
    )
}

afterEach(() => {
    mock.restore()
})

describe('readArchive', () => {
    test('returns the parsed index', async () => {
        respondWith([entry])

        expect(await readArchive()).toEqual([entry])
    })

    test('fails the build when the index is missing instead of rendering an empty site', async () => {
        respondWith({ message: 'NoSuchKey' }, 404)

        await expect(readArchive()).rejects.toThrow('index.json: 404')
    })

    test('rejects an index entry that does not match the schema', async () => {
        respondWith([{ ...entry, week: 'last week' }])

        await expect(readArchive()).rejects.toThrow(/index\.json: .*week/s)
    })

    test('names the key when the index is not valid JSON', async () => {
        spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"week":'))

        await expect(readArchive()).rejects.toThrow('index.json: invalid JSON')
    })
})

describe('readBrief', () => {
    test('returns the parsed week', async () => {
        respondWith(brief)

        expect(await readBrief('2026-11-17')).toEqual(brief)
    })

    test('throws when the week is missing', async () => {
        respondWith({ message: 'NoSuchKey' }, 404)

        await expect(readBrief('2026-11-17')).rejects.toThrow(
            'weeks/2026-11-17.json: 404'
        )
    })

    test('rejects a release link that is not https', async () => {
        respondWith({
            ...brief,
            releases: [{ ...brief.releases[0], url: 'javascript:alert(1)' }],
        })

        await expect(readBrief('2026-11-17')).rejects.toThrow('url')
    })

    test('rejects an unknown item kind', async () => {
        respondWith({
            ...brief,
            items: [{ ...brief.items[0], kind: 'gossip' }],
        })

        await expect(readBrief('2026-11-17')).rejects.toThrow(
            'weeks/2026-11-17.json'
        )
    })
})

describe('readWeekParams', () => {
    test('lists one page per framework that has items that week', async () => {
        respondWith([entry])

        expect(await readWeekParams()).toEqual([
            { framework: 'react', week: '2026-11-17' },
            { framework: 'expo', week: '2026-11-17' },
        ])
    })
})
