import {
    INDEX_KEY,
    STORAGE_BUCKET,
    WEEK_KEY_PREFIX,
} from '../constants/storage.constants'
import type { Brief } from '../types/brief.types'

import { toEntry } from './entry'

function client(): Bun.S3Client {
    const accessKeyId = process.env.STORAGE_KEY
    const secretAccessKey = process.env.STORAGE_SECRET
    const endpoint = process.env.STORAGE_ENDPOINT

    if (!accessKeyId || !secretAccessKey || !endpoint) {
        throw new Error(
            'STORAGE_KEY, STORAGE_SECRET and STORAGE_ENDPOINT must be set to publish'
        )
    }

    return new Bun.S3Client({
        accessKeyId,
        bucket: STORAGE_BUCKET,
        endpoint,
        region: 'auto',
        secretAccessKey,
    })
}

const JSON_FILE = { type: 'application/json' } as const

export function weekKey(week: string): string {
    return `${WEEK_KEY_PREFIX}${week}.json`
}

export async function publishBrief(brief: Brief): Promise<void> {
    const storage = client()

    await storage.write(
        weekKey(brief.week),
        `${JSON.stringify(brief, null, 2)}\n`,
        JSON_FILE
    )

    const listed = await storage.list({ prefix: WEEK_KEY_PREFIX })
    const keys = (listed.contents ?? [])
        .map(object => object.key)
        .filter(key => key.endsWith('.json'))

    const briefs = await Promise.all(
        keys.map(
            async key => JSON.parse(await storage.file(key).text()) as Brief
        )
    )

    const index = briefs
        .map(toEntry)
        .sort((a, b) => b.week.localeCompare(a.week))

    await storage.write(
        INDEX_KEY,
        `${JSON.stringify(index, null, 2)}\n`,
        JSON_FILE
    )
}
