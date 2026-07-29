import { Feed } from 'feed'

import { SITE_NAME, SITE_URL } from '../constants/site.constants'
import type { ArchiveEntry, RepoConfig } from '../types/brief.types'

import { formatRange } from './window'

function itemCount(entry: ArchiveEntry, slug: string): number {
    return entry.frameworks.find(item => item.slug === slug)?.itemCount ?? 0
}

export function buildFeed(config: RepoConfig, entries: ArchiveEntry[]): string {
    const home = `${SITE_URL}/${config.slug}`

    const feed = new Feed({
        copyright: SITE_NAME,
        description: `${config.title}'de hafta hafta ne değişti.`,
        feedLinks: { rss: `${home}/feed.xml` },
        id: home,
        language: 'tr',
        link: home,
        title: `${config.title} · ${SITE_NAME}`,
    })

    for (const entry of entries) {
        const url = `${home}/${entry.week}`

        feed.addItem({
            date: new Date(entry.until),
            description: `${itemCount(entry, config.slug)} madde`,
            id: url,
            link: url,
            title: formatRange(entry.since, entry.until),
        })
    }

    return feed.rss2()
}
