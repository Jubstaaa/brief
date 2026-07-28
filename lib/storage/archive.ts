import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { ArchiveEntry, Brief } from '../types/brief.types'

export const DATA_DIR = join(process.cwd(), 'data')

export function toEntry(brief: Brief): ArchiveEntry {
    return {
        highlightCount: brief.highlights.length,
        since: brief.since,
        total: brief.counts.reduce((sum, count) => sum + count.total, 0),
        until: brief.until,
        week: brief.week,
    }
}

export async function readBriefs(): Promise<Brief[]> {
    const files = (await readdir(DATA_DIR).catch(() => [] as string[])).filter(
        file => file.endsWith('.json')
    )

    const briefs = await Promise.all(
        files.map(
            async file =>
                JSON.parse(
                    await readFile(join(DATA_DIR, file), 'utf8')
                ) as Brief
        )
    )

    return briefs.sort((a, b) => b.week.localeCompare(a.week))
}

export async function readBrief(week: string): Promise<Brief | null> {
    return readFile(join(DATA_DIR, `${week}.json`), 'utf8')
        .then(contents => JSON.parse(contents) as Brief)
        .catch(() => null)
}

export async function writeBrief(brief: Brief): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(
        join(DATA_DIR, `${brief.week}.json`),
        `${JSON.stringify(brief, null, 2)}\n`
    )
}
