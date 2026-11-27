import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import type { BriefItem } from '@/lib/brief'

import WeekItem from './week-item'

function item(snippet: string): BriefItem {
    return {
        action: 'nothing to do',
        code: { lang: 'md', snippet },
        detail: 'detail',
        headline: 'headline',
        kind: 'fix',
        pr: 1,
        repo: 'react',
    }
}

describe('WeekItem', () => {
    test('keeps a snippet that contains a code fence inside one code block', () => {
        const html = renderToStaticMarkup(
            <WeekItem
                item={item('```\n# not a heading\n[x](https://evil.test)')}
                ordinal={1}
            />
        )

        expect(html).not.toContain('<h1')
        expect(html).not.toContain('href="https://evil.test"')
        expect(html.match(/<pre>/g)).toHaveLength(1)
    })
})
