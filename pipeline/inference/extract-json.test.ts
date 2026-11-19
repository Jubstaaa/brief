import { describe, expect, test } from 'bun:test'

import { extractJson } from './extract-json'

describe('extractJson', () => {
    test('parses a bare object', () => {
        expect(extractJson('{"a":1}')).toEqual({ a: 1 })
    })

    test('reads the object out of a fenced json block', () => {
        expect(
            extractJson('Here you go:\n```json\n{"a":1}\n```\nDone.')
        ).toEqual({ a: 1 })
    })

    test('ignores prose around an unfenced object', () => {
        expect(extractJson('Sure! {"a":{"b":[1,2]}} Hope that helps.')).toEqual(
            {
                a: { b: [1, 2] },
            }
        )
    })

    test('keeps nested braces inside strings', () => {
        expect(extractJson('{"snippet":"function f() { return {} }"}')).toEqual(
            {
                snippet: 'function f() { return {} }',
            }
        )
    })

    test('throws when there is no object', () => {
        expect(() => extractJson('no json here')).toThrow(
            'no JSON object found in response'
        )
    })
})
