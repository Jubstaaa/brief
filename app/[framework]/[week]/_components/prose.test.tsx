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

    test('drops the target of a plain http link written by the model', () => {
        const html = renderToStaticMarkup(
            <Prose content="[guide](http://evil.test/migrate)" />
        )

        expect(html).not.toContain('evil.test')
        expect(html).toContain('guide')
    })
})
