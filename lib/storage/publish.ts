import {
    INDEX_KEY,
    SPACES_BUCKET,
    SPACES_ENDPOINT,
    SPACES_REGION,
    WEEK_KEY_PREFIX,
} from '../constants/spaces.constants'
import type { Brief } from '../types/brief.types'

import { toEntry } from './entry'

function client(): Bun.S3Client {
    const accessKeyId = process.env.SPACES_KEY
    const secretAccessKey = process.env.SPACES_SECRET

    if (!accessKeyId || !secretAccessKey) {
        throw new Error('SPACES_KEY and SPACES_SECRET must be set to publish')
    }

    return new Bun.S3Client({
        accessKeyId,
        bucket: SPACES_BUCKET,
        endpoint: SPACES_ENDPOINT,
        region: SPACES_REGION,
        secretAccessKey,
    })
}

const PUBLIC_JSON = { acl: 'public-read', type: 'application/json' } as const

export function weekKey(week: string): string {
    return `${WEEK_KEY_PREFIX}${week}.json`
}

export async function publishBrief(brief: Brief): Promise<void> {
    const spaces = client()

    await spaces.write(
        weekKey(brief.week),
        `${JSON.stringify(brief, null, 2)}\n`,
        PUBLIC_JSON
    )

    const listed = await spaces.list({ prefix: WEEK_KEY_PREFIX })
    const keys = (listed.contents ?? [])
        .map(object => object.key)
        .filter(key => key.endsWith('.json'))

    const briefs = await Promise.all(
        keys.map(
            async key => JSON.parse(await spaces.file(key).text()) as Brief
        )
    )

    const index = briefs
        .map(toEntry)
        .sort((a, b) => b.week.localeCompare(a.week))

    await spaces.write(
        INDEX_KEY,
        `${JSON.stringify(index, null, 2)}\n`,
        PUBLIC_JSON
    )
}
