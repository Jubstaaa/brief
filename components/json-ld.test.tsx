import { describe, expect, test } from 'bun:test'

import { renderToStaticMarkup } from 'react-dom/server'

import JsonLd from './json-ld'

describe('JsonLd', () => {
    test('cannot be closed early by a value containing </script>', () => {
        const html = renderToStaticMarkup(
            <JsonLd
                schema={{ headline: '</script><script>alert(1)</script>' }}
            />
        )

        expect(html.match(/<\/script>/g)).toHaveLength(1)
        expect(
            JSON.parse(html.replace(/^<script[^>]*>|<\/script>$/g, ''))
        ).toEqual({
            headline: '</script><script>alert(1)</script>',
        })
    })
})
