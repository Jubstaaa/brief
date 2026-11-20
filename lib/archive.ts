import type { z } from 'zod'

import {
    type ArchiveEntry,
    archiveSchema,
    type Brief,
    briefSchema,
    parseStoredJson,
} from './brief'
import { INDEX_KEY, SPACES_PUBLIC_BASE_URL, WEEK_KEY_PREFIX } from './spaces'

// index.json and every week it lists are written by the pipeline, so a missing
// one is a broken bucket, never an empty archive: fail the build rather than
// deploy a site without weeks.
async function fetchJson<T extends z.ZodType>(
    key: string,
    schema: T
): Promise<z.infer<T>> {
    const response = await fetch(`${SPACES_PUBLIC_BASE_URL}/${key}`, {
        cache: 'force-cache',
    })

    if (!response.ok) {
        throw new Error(`${key}: ${response.status} ${response.statusText}`)
    }

    return parseStoredJson(schema, key, await response.text())
}

export async function readArchive(): Promise<ArchiveEntry[]> {
    return fetchJson(INDEX_KEY, archiveSchema)
}

export async function readBrief(week: string): Promise<Brief> {
    return fetchJson(`${WEEK_KEY_PREFIX}${week}.json`, briefSchema)
}

export async function readWeekParams(): Promise<
    { framework: string; week: string }[]
> {
    const entries = await readArchive()

    return entries.flatMap(entry =>
        entry.frameworks.map(framework => ({
            framework: framework.slug,
            week: entry.week,
        }))
    )
}
