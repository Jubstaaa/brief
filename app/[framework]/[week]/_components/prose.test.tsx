import { describe, expect, test } from 'bun:test'

import { renderToStaticMarkup } from 'react-dom/server'

import Prose from './prose'

describe('Prose', () => {
    test('keeps https links the model writes', () => {
        expect(
            renderToStaticMarkup(
                <Prose content="[docs](https://react.dev/reference)" />
            )
        ).toContain('href="https://react.dev/reference"')
    })

    test.each([
        ['plain http', '[guide](http://evil.test/migrate)'],
        ['protocol-relative', '[guide](//evil.test/migrate)'],
        ['javascript', '[guide](javascript:alert(1))'],
        ['an http image', '![guide](http://evil.test/a.png)'],
    ])('drops the target of a %s link written by the model', (_, content) => {
        const html = renderToStaticMarkup(<Prose content={content} />)

        expect(html).not.toMatch(/(href|src)=/)
    })

    test('drops relative links, which mean nothing on this site', () => {
        expect(
            renderToStaticMarkup(<Prose content="[guide](/docs)" />)
        ).not.toMatch(/href=/)
    })
})
