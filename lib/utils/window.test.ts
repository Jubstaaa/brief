import { describe, expect, test } from 'bun:test'

import { formatRange, resolveWindow } from './window'

describe('resolveWindow', () => {
    test('covers the seven days ending on the current Tuesday', () => {
        const window = resolveWindow(new Date('2026-07-28T06:00:00Z'))

        expect(window.week).toBe('2026-07-28')
        expect(window.since).toBe('2026-07-20T21:00:00.000Z')
        expect(window.until).toBe('2026-07-27T21:00:00.000Z')
    })

    test('walks back to the previous Tuesday midway through the week', () => {
        expect(resolveWindow(new Date('2026-07-31T10:00:00Z')).week).toBe(
            '2026-07-28'
        )
    })

    test('treats Tuesday just after local midnight as the new week', () => {
        expect(resolveWindow(new Date('2026-07-27T21:30:00Z')).week).toBe(
            '2026-07-28'
        )
    })

    test('still reports the previous week just before local midnight', () => {
        expect(resolveWindow(new Date('2026-07-27T20:30:00Z')).week).toBe(
            '2026-07-21'
        )
    })

    test('spans exactly seven days', () => {
        const window = resolveWindow(new Date('2026-07-28T06:00:00Z'))
        const days =
            (new Date(window.until).getTime() -
                new Date(window.since).getTime()) /
            86_400_000

        expect(days).toBe(7)
    })

    test('crosses a month boundary without drifting', () => {
        const window = resolveWindow(new Date('2026-09-01T09:00:00Z'))

        expect(window.week).toBe('2026-09-01')
        expect(window.since).toBe('2026-08-24T21:00:00.000Z')
    })
})

describe('formatRange', () => {
    test('excludes the open end of the window', () => {
        const window = resolveWindow(new Date('2026-07-28T06:00:00Z'))

        expect(formatRange(window.since, window.until)).toBe(
            '21 Temmuz – 27 Temmuz'
        )
    })
})
