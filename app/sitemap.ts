import type { MetadataRoute } from 'next'

import { readArchive } from '@/lib/archive'
import { REPOS } from '@/lib/repos'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await readArchive()
    const newest = entries[0]?.until

    const weeks = entries.flatMap(entry =>
        entry.frameworks.map(framework => ({
            lastModified: entry.until,
            priority: 0.8,
            url: `${SITE_URL}/${framework.slug}/${entry.week}`,
        }))
    )

    const archives = REPOS.filter(config =>
        entries.some(entry =>
            entry.frameworks.some(item => item.slug === config.slug)
        )
    ).map(config => ({
        lastModified: newest,
        priority: 0.9,
        url: `${SITE_URL}/${config.slug}`,
    }))

    return [
        { lastModified: newest, priority: 1, url: SITE_URL },
        ...archives,
        ...weeks,
    ]
}
