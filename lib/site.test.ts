import { describe, expect, test } from 'bun:test'

import { pageUrl, SITE_URL } from './site'

describe('pageUrl', () => {
    test('matches the trailing-slash canonical of the static export', () => {
        expect(pageUrl()).toBe(`${SITE_URL}/`)
        expect(pageUrl('react')).toBe(`${SITE_URL}/react/`)
        expect(pageUrl('next-js', '2026-11-17')).toBe(
            `${SITE_URL}/next-js/2026-11-17/`
        )
    })
})
