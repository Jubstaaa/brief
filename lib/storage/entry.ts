import { REPOS } from '../constants/repos.constants'
import type {
    ArchiveEntry,
    ArchiveFramework,
    Brief,
} from '../types/brief.types'

function frameworkCounts(brief: Brief): ArchiveFramework[] {
    return REPOS.map(config => ({
        itemCount: brief.items.filter(item => item.repo === config.label)
            .length,
        slug: config.slug,
    })).filter(framework => framework.itemCount > 0)
}

export function toEntry(brief: Brief): ArchiveEntry {
    return {
        frameworks: frameworkCounts(brief),
        itemCount: brief.items.length,
        since: brief.since,
        total: brief.counts.reduce((sum, count) => sum + count.total, 0),
        until: brief.until,
        week: brief.week,
    }
}
