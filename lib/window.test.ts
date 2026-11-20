import { describe, expect, test } from 'bun:test'

import { formatRange, resolveWindow, windowFromOptions } from './window'

describe('resolveWindow', () => {
    test('covers the seven days ending at 09:00 on the current Tuesday', () => {
        const window = resolveWindow(new Date('2026-07-28T06:00:00Z'))

        expect(window.week).toBe('2026-07-28')
        expect(window.since).toBe('2026-07-21T06:00:00.000Z')
        expect(window.until).toBe('2026-07-28T06:00:00.000Z')
    })

    test('walks back to the previous Tuesday midway through the week', () => {
        expect(resolveWindow(new Date('2026-07-31T10:00:00Z')).week).toBe(
            '2026-07-28'
        )
    })

    test('treats Tuesday before the 09:00 anchor as the previous week', () => {
        expect(resolveWindow(new Date('2026-07-28T04:00:00Z')).week).toBe(
            '2026-07-21'
        )
    })

    test('treats Tuesday at the 09:00 anchor as the new week', () => {
        expect(resolveWindow(new Date('2026-08-04T06:00:00Z')).week).toBe(
            '2026-08-04'
        )
    })

    test('still reports the previous week on Monday night', () => {
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
        expect(window.since).toBe('2026-08-25T06:00:00.000Z')
    })
})

describe('formatRange', () => {
    test('excludes the open end of the window', () => {
        const window = resolveWindow(new Date('2026-07-28T06:00:00Z'))

        expect(formatRange(window.since, window.until)).toBe(
            '21 Temmuz – 28 Temmuz'
        )
    })
})

describe('windowFromOptions', () => {
    const now = new Date('2026-07-28T06:00:00Z')

    test('falls back to the resolved window for options that were not given', () => {
        expect(
            windowFromOptions(
                { since: undefined, until: undefined, week: undefined },
                now
            )
        ).toEqual(resolveWindow(now))
    })

    test('applies overrides and publishes them in UTC', () => {
        expect(
            windowFromOptions(
                {
                    since: '2026-07-14T09:00:00+03:00',
                    until: '2026-07-21T09:00:00+03:00',
                    week: '2026-07-21',
                },
                now
            )
        ).toEqual({
            since: '2026-07-14T06:00:00.000Z',
            until: '2026-07-21T06:00:00.000Z',
            week: '2026-07-21',
        })
    })

    test('rejects a week label that is not a date, since it becomes a bucket key', () => {
        expect(() => windowFromOptions({ week: '../index' }, now)).toThrow(
            'week'
        )
    })

    test('rejects a window bound that is not an ISO date-time', () => {
        expect(() => windowFromOptions({ since: 'last tuesday' }, now)).toThrow(
            'since'
        )
    })

    test('rejects a window that ends before it starts', () => {
        expect(() =>
            windowFromOptions({ since: '2026-07-29T00:00:00Z' }, now)
        ).toThrow('since must be before until')
    })
})
