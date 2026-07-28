import { SITE_NAME, SITE_URL } from '../constants/site.constants'
import type { ArchiveEntry, RepoConfig } from '../types/brief.types'

import { formatRange } from './window'

function escape(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

export function buildFeed(config: RepoConfig, entries: ArchiveEntry[]): string {
    const self = `${SITE_URL}/${config.slug}/feed.xml`
    const title = `${config.title} · ${SITE_NAME}`
    const description = `${config.title}'de hafta hafta ne değişti.`

    const items = entries.map(entry => {
        const url = `${SITE_URL}/${config.slug}/${entry.week}`
        const count =
            entry.frameworks.find(item => item.slug === config.slug)
                ?.itemCount ?? 0

        return [
            '        <item>',
            `            <title>${escape(formatRange(entry.since, entry.until))}</title>`,
            `            <link>${url}</link>`,
            `            <guid isPermaLink="true">${url}</guid>`,
            `            <pubDate>${new Date(entry.until).toUTCString()}</pubDate>`,
            `            <description>${escape(`${count} madde`)}</description>`,
            '        </item>',
        ].join('\n')
    })

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '    <channel>',
        `        <title>${escape(title)}</title>`,
        `        <link>${SITE_URL}/${config.slug}</link>`,
        `        <description>${escape(description)}</description>`,
        '        <language>tr</language>',
        `        <atom:link href="${self}" rel="self" type="application/rss+xml" />`,
        ...items,
        '    </channel>',
        '</rss>',
        '',
    ].join('\n')
}
