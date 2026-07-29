import { Feed } from 'feed'

import { findRepoBySlug } from '../constants/repos.constants'
import {
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_URL,
} from '../constants/site.constants'
import type { ArchiveEntry, RepoConfig } from '../types/brief.types'

import { formatRange } from './window'

function itemCount(entry: ArchiveEntry, slug: string): number {
    return entry.frameworks.find(item => item.slug === slug)?.itemCount ?? 0
}

export function buildFrameworkFeed(
    config: RepoConfig,
    entries: ArchiveEntry[]
): string {
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

const SITE_FEED_LIMIT = 50

export function buildSiteFeed(entries: ArchiveEntry[]): string {
    const feed = new Feed({
        copyright: SITE_NAME,
        description: SITE_DESCRIPTION,
        feedLinks: { rss: `${SITE_URL}/feed.xml` },
        id: SITE_URL,
        language: 'tr',
        link: SITE_URL,
        title: SITE_NAME,
    })

    const recent = entries
        .flatMap(entry =>
            entry.frameworks.map(framework => ({ entry, framework }))
        )
        .slice(0, SITE_FEED_LIMIT)

    for (const { entry, framework } of recent) {
        const config = findRepoBySlug(framework.slug)

        if (!config) continue

        const url = `${SITE_URL}/${config.slug}/${entry.week}`

        feed.addItem({
            category: [{ name: config.title }],
            date: new Date(entry.until),
            description: `${framework.itemCount} madde`,
            id: url,
            link: url,
            title: `${config.title} · ${formatRange(entry.since, entry.until)}`,
        })
    }

    return feed.rss2()
}
