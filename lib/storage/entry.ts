import type { ArchiveEntry, Brief } from '../types/brief.types'

export function toEntry(brief: Brief): ArchiveEntry {
    return {
        highlightCount: brief.highlights.length,
        since: brief.since,
        total: brief.counts.reduce((sum, count) => sum + count.total, 0),
        until: brief.until,
        week: brief.week,
    }
}
