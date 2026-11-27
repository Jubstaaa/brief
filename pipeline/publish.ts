import {
    type Brief,
    briefSchema,
    parseStored,
    parseStoredJson,
} from '@/lib/brief'
import {
    INDEX_KEY,
    SPACES_BUCKET,
    SPACES_ENDPOINT,
    SPACES_REGION,
    WEEK_KEY_PREFIX,
} from '@/lib/spaces'

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

export async function publishBrief(brief: Brief): Promise<void> {
    const spaces = client()
    const key = weekKey(brief.week)
    const checked = parseStored(briefSchema, key, brief)

    const listed = await spaces.list({ prefix: WEEK_KEY_PREFIX })
    const storedKeys = (listed.contents ?? [])
        .map(object => object.key)
        .filter(stored => stored.endsWith('.json') && stored !== key)

    const stored = await Promise.all(
        storedKeys.map(async stored =>
            parseStoredJson(
                briefSchema,
                stored,
                await spaces.file(stored).text()
            )
        )
    )

    const index = [checked, ...stored]
        .map(toEntry)
        .sort((a, b) => b.week.localeCompare(a.week))

    await spaces.write(
        key,
        `${JSON.stringify(checked, null, 2)}\n`,
        PUBLIC_JSON
    )
    await spaces.write(
        INDEX_KEY,
        `${JSON.stringify(index, null, 2)}\n`,
        PUBLIC_JSON
    )
}

function weekKey(week: string): string {
    return `${WEEK_KEY_PREFIX}${week}.json`
}
