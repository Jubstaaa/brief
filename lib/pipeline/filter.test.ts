import { describe, expect, test } from 'bun:test'

import { extractPrNumber, firstLine } from '../github/commits'
import type { Commit } from '../types/brief.types'

import { filterCommits, isNoise } from './filter'

function commit(title: string): Commit {
    return {
        prNumber: extractPrNumber(title),
        sha: title,
        title,
        url: `https://example.test/${title}`,
    }
}

describe('extractPrNumber', () => {
    test('reads the trailing pull request number', () => {
        expect(
            extractPrNumber(
                'Serve cached misses from the filesystem route cache (#96230)'
            )
        ).toBe(96230)
    })

    test('ignores a reference that is not at the end', () => {
        expect(extractPrNumber('Fix (#123) regression in router')).toBeNull()
    })

    test('returns null when there is no number', () => {
        expect(extractPrNumber('v16.3.0-canary.98')).toBeNull()
    })
})

describe('isNoise', () => {
    const noise = [
        'v16.3.0-canary.98',
        'v5.1.0',
        'chore: update lockfile',
        'docs: document query-only href resolution',
        '[test] Unflake more tests (#96081)',
        'Upgrade React from `28cd4bb0` to `756fdd47` (#96270)',
        'Update README.md',
        'Bump the eslint version (#123)',
        'fix typo in comment (#9)',
    ]

    const signal = [
        'Block prefetch task until sufficient response is received (#96017)',
        'Turbopack: Only extend the watcher batch window for unfiltered events (#96186)',
        '[Flight] Limit fake JSX call site stacks to 10 frames (#37086)',
        'fix: prefetch cache key collision (#42)',
    ]

    for (const title of noise) {
        test(`drops: ${title}`, () => expect(isNoise(title)).toBe(true))
    }

    for (const title of signal) {
        test(`keeps: ${title}`, () => expect(isNoise(title)).toBe(false))
    }
})

describe('filterCommits', () => {
    test('removes noise and reports how much was dropped', () => {
        const result = filterCommits([
            commit(
                'Block prefetch task until sufficient response is received (#96017)'
            ),
            commit('v16.3.0-canary.98'),
            commit('chore: bump deps'),
        ])

        expect(result.kept).toHaveLength(1)
        expect(result.dropped).toBe(2)
    })

    test('deduplicates repeated pull request numbers', () => {
        const result = filterCommits([
            commit('Add prefetch guard (#100)'),
            commit('Add prefetch guard (#100)'),
        ])

        expect(result.kept).toHaveLength(1)
        expect(result.dropped).toBe(1)
    })

    test('keeps distinct commits that carry no pull request number', () => {
        expect(
            filterCommits([
                commit('Land the new watcher'),
                commit('Wire it up'),
            ]).kept
        ).toHaveLength(2)
    })
})

describe('firstLine', () => {
    test('takes only the subject of a multi-line message', () => {
        expect(firstLine('Add guard (#1)\n\nLong body here')).toBe(
            'Add guard (#1)'
        )
    })
})
